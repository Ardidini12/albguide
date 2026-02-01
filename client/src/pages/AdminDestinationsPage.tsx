import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { apiFetch, authHeader } from '../services/api';
import { useAuth } from '../hooks/useAuth';

type DestinationRow = {
  id: string;
  name: string;
  slug: string;
  region: string;
  description: string;
  image_url: string | null;
  image_path?: string | null;
  media_urls?: string[];
  media_paths?: string[];
  best_time: string | null;
  highlights: string[];
  activities: string[];
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function splitCsv(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

 function isVideoUrl(url: string) {
   const clean = url.split('?')[0]?.toLowerCase() ?? '';
   return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.mov') || clean.endsWith('.m4v');
 }

export function AdminDestinationsPage() {
  const { token } = useAuth();

  const supabase = useMemo(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !anon) return null;
    if (/storage\.supabase\.co/i.test(String(url)) || /\/storage\/v1\//i.test(String(url)) || /\/s3\b/i.test(String(url))) {
      return null;
    }
    return createClient(url, anon, { auth: { persistSession: false } });
  }, []);

  const [items, setItems] = useState<DestinationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [region, setRegion] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePath, setImagePath] = useState<string>('');
  const [mediaItems, setMediaItems] = useState<Array<{ path: string; url: string }>>([]);
  const [bestTime, setBestTime] = useState('');
  const [highlights, setHighlights] = useState('');
  const [activities, setActivities] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setRegion('');
    setDescription('');
    setImageUrl('');
    setImagePath('');
    setMediaItems([]);
    setBestTime('');
    setHighlights('');
    setActivities('');
    setIsFeatured(false);
    setIsActive(true);
  };

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch('/admin/destinations', { headers: authHeader(token) });
      setItems(data.destinations || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onEdit = (d: DestinationRow) => {
    setEditingId(d.id);
    setName(d.name || '');
    setSlug(d.slug || '');
    setRegion(d.region || '');
    setDescription(d.description || '');
    setImageUrl(d.image_url || '');
    setImagePath(String(d.image_path || ''));
    if (Array.isArray(d.media_paths) && Array.isArray(d.media_urls) && d.media_paths.length) {
      const next = d.media_paths.map((p, idx) => ({ path: String(p), url: String(d.media_urls?.[idx] || '') }));
      setMediaItems(next);
    } else if (d.image_url && d.image_path) {
      setMediaItems([{ path: String(d.image_path), url: String(d.image_url) }]);
    } else {
      setMediaItems([]);
    }
    setBestTime(d.best_time || '');
    setHighlights((d.highlights || []).join(', '));
    setActivities((d.activities || []).join(', '));
    setIsFeatured(Boolean(d.is_featured));
    setIsActive(Boolean(d.is_active));
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this destination?')) return;

    setError(null);
    try {
      await apiFetch(`/admin/destinations/${id}`, { method: 'DELETE', headers: authHeader(token) });
      await load();
      if (editingId === id) resetForm();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const onUpload = async (files: File[]) => {
    setError(null);

    if (!supabase) {
      throw new Error(
        'Invalid Supabase client config. VITE_SUPABASE_URL must be https://<ref>.supabase.co (project URL), not a storage/s3 endpoint.'
      );
    }

    let primaryPath = imagePath;

    for (const file of files) {
      const sign = await apiFetch('/admin/uploads/sign', {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify({ folder: 'destinations', contentType: file.type }),
      });

      const path = String(sign.path || '');
      const uploadToken = String(sign.token || '');

      if (!path || !uploadToken) {
        throw new Error('Upload signature response missing path/token');
      }

      const { error: uploadError } = await supabase.storage
        .from(String(sign.bucket || ''))
        .uploadToSignedUrl(path, uploadToken, file, { contentType: file.type });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const read = await apiFetch('/admin/uploads/read-url', {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify({ path, expiresInSeconds: 3600 }),
      });

      const signedUrl = String(read.signedUrl || '');
      setMediaItems((prev) => [...prev, { path, url: signedUrl }]);

      if (!primaryPath) {
        primaryPath = path;
        setImagePath(path);
      }
      setImageUrl(signedUrl);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const rawMediaPaths = mediaItems.map((m) => m.path).filter(Boolean);
    const primary = imagePath || rawMediaPaths[0] || '';
    const deduped = Array.from(new Set(rawMediaPaths));
    const ordered = primary ? [primary, ...deduped.filter((p) => p !== primary)] : deduped;
    const external = imageUrl && /^https?:\/\//i.test(imageUrl) ? [imageUrl] : [];
    const media_urls = ordered.length ? ordered : external;

    const payload = {
      name,
      slug: slug || undefined,
      region,
      description,
      media_urls,
      best_time: bestTime || null,
      highlights: splitCsv(highlights),
      activities: splitCsv(activities),
      is_featured: isFeatured,
      is_active: isActive,
    };

    try {
      if (editingId) {
        await apiFetch(`/admin/destinations/${editingId}`, {
          method: 'PUT',
          headers: authHeader(token),
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/admin/destinations', {
          method: 'POST',
          headers: authHeader(token),
          body: JSON.stringify(payload),
        });
      }

      await load();
      resetForm();
    } catch (e2) {
      setError((e2 as Error).message);
    }
  };

  const summary = useMemo(() => {
    const total = items.length;
    const active = items.filter((i) => i.is_active).length;
    return { total, active };
  }, [items]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Destinations</h1>
            <p className="mt-1 text-gray-600">
              Manage destinations. Total: {summary.total}. Active: {summary.active}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50">
              Refresh
            </button>
            <button
              onClick={resetForm}
              className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50"
              type="button"
            >
              New
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={onSubmit} className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="text-sm font-semibold text-gray-900">
                {editingId ? 'Edit Destination' : 'Create Destination'}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Slug</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  placeholder="auto-generated if empty"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Region *</label>
                <input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Media (Image/Video)</label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="mt-1 w-full text-sm"
                  multiple
                  onChange={(e) => {
                    const list = Array.from(e.target.files || []);
                    if (!list.length) return;
                    onUpload(list).catch((err) => setError((err as Error).message));
                  }}
                />
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700">Media URL</label>
                  <input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    placeholder="https://..."
                  />
                </div>
                {imageUrl && (
                  <div className="mt-3 rounded-xl border overflow-hidden bg-gray-50">
                    {imageUrl.match(/\.(mp4|webm|mov)(\?.*)?$/i) ? (
                      <video src={imageUrl} controls className="w-full h-48 object-cover" />
                    ) : (
                      <img src={imageUrl} alt="preview" className="w-full h-48 object-cover" />
                    )}
                  </div>
                )}

                {mediaItems.length > 1 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {mediaItems.map((m) => (
                      <button
                        key={m.path}
                        type="button"
                        onClick={() => {
                          setImagePath(m.path);
                          setImageUrl(m.url);
                        }}
                        className={
                          m.path === imagePath
                            ? 'rounded-lg overflow-hidden border-2 border-purple-700 bg-gray-50'
                            : 'rounded-lg overflow-hidden border bg-gray-50 hover:border-gray-300'
                        }
                      >
                        {m.url.match(/\.(mp4|webm|mov)(\?.*)?$/i) ? (
                          <video src={m.url} className="w-full h-20 object-cover" />
                        ) : (
                          <img src={m.url} alt="" className="w-full h-20 object-cover" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Best time</label>
                <input
                  value={bestTime}
                  onChange={(e) => setBestTime(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Highlights (comma-separated)</label>
                <textarea
                  value={highlights}
                  onChange={(e) => setHighlights(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Activities (comma-separated)</label>
                <textarea
                  value={activities}
                  onChange={(e) => setActivities(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  rows={2}
                />
              </div>

              <div className="flex items-end gap-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                    />
                    Featured
                  </label>

                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    Active
                  </label>
              </div>

              <button
                className="w-full rounded-md bg-red-700 text-white py-2 text-sm font-medium hover:bg-red-600"
                type="submit"
              >
                {editingId ? 'Save changes' : 'Create destination'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900">Existing destinations</div>
                {loading && <div className="text-sm text-gray-500">Loading…</div>}
              </div>

              <div className="mt-4 space-y-3">
                {items.map((d) => (
                  <div key={d.id} className="rounded-xl border p-4 flex gap-4">
                    <div className="w-28 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {(() => {
                        const thumb = String((d.media_urls && d.media_urls[0]) || d.image_url || '');
                        if (thumb && isVideoUrl(thumb)) {
                          return (
                            <video
                              key={thumb}
                              src={thumb}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                              preload="metadata"
                            />
                          );
                        }

                        return (
                          <img
                            src={thumb || '/placeholder.jpg'}
                            alt={d.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        );
                      })()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-gray-900 truncate">{d.name}</div>
                          <div className="text-xs text-gray-500">/{d.slug} • {d.region}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onEdit(d)}
                            className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(d.id)}
                            className="px-3 py-1.5 rounded-md bg-red-700 text-white text-sm hover:bg-red-600"
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 text-sm text-gray-600 line-clamp-2">{d.description}</div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                          {d.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {d.is_featured && (
                          <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">Featured</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {items.length === 0 && !loading && (
                  <div className="rounded-xl border bg-gray-50 p-8 text-center text-gray-600">
                    No destinations yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
