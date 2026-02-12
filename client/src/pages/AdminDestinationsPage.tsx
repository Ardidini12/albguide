import { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { gsap } from 'gsap';
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
  return value.split(',').map((v) => v.trim()).filter(Boolean);
}

function isVideoUrl(url: string) {
  const clean = url.split('?')[0]?.toLowerCase() ?? '';
  return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.mov') || clean.endsWith('.m4v');
}

export function AdminDestinationsPage() {
  const { token } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

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

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useLayoutEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.from('.kinetic-header', { y: -50, opacity: 0, duration: 1, ease: 'power4.out' });
      gsap.from('.form-card', { x: -50, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 });
      gsap.from('.list-card', { x: 50, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.4 });
      gsap.from('.destination-item', { y: 20, opacity: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out', delay: 0.6 });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const deleteFromStorage = async (path: string) => {
    try {
      await apiFetch('/admin/uploads', {
        method: 'DELETE',
        headers: authHeader(token),
        body: JSON.stringify({ path }),
      });
    } catch (err) {
      console.error('Failed to delete from storage:', err);
    }
  };

  const onUpload = async (files: File[]) => {
    setError(null);
    if (!supabase) throw new Error('Invalid Supabase client config.');

    let primaryPath = imagePath;
    for (const file of files) {
      const sign = await apiFetch('/admin/uploads/sign', {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify({ folder: 'destinations', contentType: file.type }),
      });

      const path = String(sign.path || '');
      const uploadToken = String(sign.token || '');
      if (!path || !uploadToken) throw new Error('Upload signature response missing path/token');

      const { error: uploadError } = await supabase.storage.from(String(sign.bucket || '')).uploadToSignedUrl(path, uploadToken, file, { contentType: file.type });
      if (uploadError) throw new Error(uploadError.message);

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
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      name, slug: slug || undefined, region, description, media_urls,
      best_time: bestTime || null, highlights: splitCsv(highlights), activities: splitCsv(activities),
      is_featured: isFeatured, is_active: isActive,
    };

    try {
      if (editingId) {
        await apiFetch(`/admin/destinations/${editingId}`, { method: 'PUT', headers: authHeader(token), body: JSON.stringify(payload) });
      } else {
        await apiFetch('/admin/destinations', { method: 'POST', headers: authHeader(token), body: JSON.stringify(payload) });
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
    <div ref={containerRef} className="bg-black min-h-screen pt-24 pb-12 px-4 selection:bg-red-600 font-sans text-zinc-100">
      <div className="max-w-7xl mx-auto">
        <div className="kinetic-header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12 border-b border-white/10 pb-8">
          <div>
            <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-red-600 mb-4 transition-colors uppercase tracking-widest">
              ← Back to Dashboard
            </Link>
            <h1 className="text-5xl md:text-7xl font-black italic uppercase text-white tracking-tighter">
              Manage <span className="text-red-600">Destinations</span>
            </h1>
            <p className="mt-4 text-xl text-zinc-400 max-w-2xl border-l-4 border-red-600 pl-6">
              Create and edit travel destinations. Total: <span className="text-white font-bold">{summary.total}</span>. Active: <span className="text-green-500 font-bold">{summary.active}</span>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={load} className="px-6 py-3 rounded-full border border-white/10 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-colors">
              Refresh
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-3 rounded-full bg-red-600 text-white font-black uppercase italic tracking-widest text-xs hover:bg-red-700 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
              type="button"
            >
              New Destination
            </button>
          </div>
        </div>

        {error && <div className="mb-8 rounded-xl border border-red-900/50 bg-red-950/30 px-6 py-4 text-sm font-bold text-red-200 animate-pulse">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 form-card">
            <form onSubmit={onSubmit} className="bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6 sticky top-24">
              <div className="text-2xl font-black italic uppercase text-white border-b border-white/5 pb-4">
                {editingId ? 'Edit Destination' : 'Create Destination'}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-red-600 focus:outline-none transition-colors placeholder-zinc-700" required />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Slug</label>
                <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-red-600 focus:outline-none transition-colors placeholder-zinc-700" placeholder="auto-generated if empty" />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Region *</label>
                <input value={region} onChange={(e) => setRegion(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-red-600 focus:outline-none transition-colors placeholder-zinc-700" required />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Description *</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:border-red-600 focus:outline-none transition-colors placeholder-zinc-700 resize-none" rows={4} required />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Media (Image/Video)</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-red-600/50 bg-black/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <p className="mb-2 text-sm text-zinc-400"><span className="font-bold text-white">Click to upload</span> or drag and drop</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" multiple onChange={(e) => { const list = Array.from(e.target.files || []); if (!list.length) return; onUpload(list).catch((err) => setError((err as Error).message)); }} />
                </label>
                <div className="mt-4">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Or Media URL</label>
                  <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-red-600 focus:outline-none transition-colors placeholder-zinc-700 text-sm" placeholder="https://..." />
                </div>
                {imageUrl && (
                  <div className="mt-4 rounded-xl border border-white/10 overflow-hidden bg-black h-48 relative group">
                    {imageUrl.match(/\.(mp4|webm|mov)(\?.*)?$/i) ? <video src={imageUrl} controls className="w-full h-full object-cover" /> : <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />}
                  </div>
                )}
                {mediaItems.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {mediaItems.map((m) => (
                      <div key={m.path} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10 bg-black">
                        <button type="button" onClick={() => { setImagePath(m.path); setImageUrl(m.url); }} className={`w-full h-full transition-opacity ${m.path === imagePath ? 'opacity-100 ring-2 ring-red-600' : 'opacity-60 hover:opacity-100'}`}>
                          {m.url.match(/\.(mp4|webm|mov)(\?.*)?$/i) ? <video src={m.url} className="w-full h-full object-cover" /> : <img src={m.url} alt="" className="w-full h-full object-cover" />}
                        </button>
                        <button type="button" onClick={async (e) => { e.stopPropagation(); await deleteFromStorage(m.path); setMediaItems((prev) => prev.filter((item) => item.path !== m.path)); if (imagePath === m.path) { const remaining = mediaItems.filter((item) => item.path !== m.path); if (remaining.length) { setImagePath(remaining[0].path); setImageUrl(remaining[0].url); } else { setImagePath(''); setImageUrl(''); } } }} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-700">
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Best time</label>
                <input value={bestTime} onChange={(e) => setBestTime(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-red-600 focus:outline-none transition-colors placeholder-zinc-700" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Highlights</label>
                <textarea value={highlights} onChange={(e) => setHighlights(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:border-red-600 focus:outline-none transition-colors placeholder-zinc-700 resize-none" rows={2} />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Activities</label>
                <textarea value={activities} onChange={(e) => setActivities(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:border-red-600 focus:outline-none transition-colors placeholder-zinc-700 resize-none" rows={2} />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="peer w-5 h-5 accent-red-600" />
                  <span className="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors uppercase tracking-wider">Featured</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="peer w-5 h-5 accent-green-600" />
                  <span className="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors uppercase tracking-wider">Active</span>
                </label>
              </div>

              <button className="w-full rounded-full bg-red-600 text-white py-4 text-sm font-black uppercase italic tracking-widest hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-red-900/20" type="submit">
                {editingId ? 'Save changes' : 'Create destination'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-3 list-card">
            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <div className="text-2xl font-black italic uppercase text-white">Existing destinations</div>
                {loading && <div className="text-sm font-bold text-zinc-500 animate-pulse">LOADING...</div>}
              </div>

              <div className="space-y-4">
                {items.map((d) => (
                  <div key={d.id} className="destination-item group relative bg-black/50 border border-white/5 rounded-2xl p-4 flex gap-4 hover:border-red-600/30 hover:bg-black/80 transition-all duration-300">
                    <div className="w-32 h-24 rounded-xl bg-zinc-800 overflow-hidden flex-shrink-0 relative">
                      {(() => {
                        const thumb = String((d.media_urls && d.media_urls[0]) || d.image_url || '');
                        if (thumb && isVideoUrl(thumb)) {
                          return <video src={thumb} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-500" muted playsInline preload="metadata" />;
                        }
                        return <img src={thumb || '/placeholder.jpg'} alt={d.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-500" loading="lazy" />;
                      })()}
                      {d.is_featured && <div className="absolute top-0 right-0 bg-yellow-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-bl-lg">Featured</div>}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-black text-xl text-white truncate group-hover:text-red-500 transition-colors uppercase italic tracking-tight">{d.name}</div>
                          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mt-1">/{d.slug} • {d.region}</div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button onClick={() => onEdit(d)} className="px-3 py-1.5 rounded-lg border border-white/20 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/10" type="button">Edit</button>
                          <button onClick={() => onDelete(d.id)} className="px-3 py-1.5 rounded-lg bg-red-900/30 border border-red-900/50 text-red-500 text-xs font-bold uppercase tracking-wider hover:bg-red-900/50" type="button">Delete</button>
                        </div>
                      </div>
                      <div className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">{d.description}</div>
                      <div className="flex items-center justify-between pt-2">
                        <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${d.is_active ? 'border-green-900/50 text-green-500 bg-green-900/10' : 'border-zinc-700 text-zinc-500 bg-zinc-900'}`}>
                          {d.is_active ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {items.length === 0 && !loading && (
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-12 text-center text-zinc-500">No destinations found</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
