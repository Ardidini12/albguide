import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { apiFetch, authHeader } from '../services/api';
import { useAuth } from '../hooks/useAuth';

type DestinationRow = {
  id: string;
  name: string;
  region: string;
  slug: string;
  is_active: boolean;
};

type PackageRow = {
  id: string;
  destination_id: string;
  name: string;
  slug: string;
  about?: string | null;
  what_youll_see?: string | null;
  itinerary?: string | null;
  whats_included?: string | null;
  whats_not_included?: string | null;
  what_to_expect?: string | null;
  meeting_and_pickup?: string | null;
  accessibility?: string | null;
  additional_information?: string | null;
  cancellation_policy?: string | null;
  help?: string | null;
  duration?: string | null;
  price?: string | null;
  currency: string;
  languages?: string[];
  group_size_max?: number | null;
  min_age?: number | null;
  location_name?: string | null;
  meeting_point_name?: string | null;
  meeting_point_address?: string | null;
  meeting_point_lat?: number | null;
  meeting_point_lng?: number | null;
  media_urls?: string[];
  media_paths?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  destination_name?: string;
  destination_region?: string;
};

function isVideoUrl(url: string) {
  const clean = url.split('?')[0]?.toLowerCase() ?? '';
  return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.mov') || clean.endsWith('.m4v');
}

export function AdminPackagesPage() {
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

  const [items, setItems] = useState<PackageRow[]>([]);
  const [destinations, setDestinations] = useState<DestinationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [destinationsLoading, setDestinationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [destinationId, setDestinationId] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [about, setAbout] = useState('');
  const [whatYoullSee, setWhatYoullSee] = useState('');
  const [itinerary, setItinerary] = useState('');
  const [whatsIncluded, setWhatsIncluded] = useState('');
  const [whatsNotIncluded, setWhatsNotIncluded] = useState('');
  const [whatToExpect, setWhatToExpect] = useState('');
  const [meetingAndPickup, setMeetingAndPickup] = useState('');
  const [accessibility, setAccessibility] = useState('');
  const [additionalInformation, setAdditionalInformation] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('');
  const [help, setHelp] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [languagesText, setLanguagesText] = useState('');
  const [groupSizeMax, setGroupSizeMax] = useState<number | ''>('');
  const [minAge, setMinAge] = useState<number | ''>('');
  const [locationName, setLocationName] = useState('');
  const [meetingPointName, setMeetingPointName] = useState('');
  const [meetingPointAddress, setMeetingPointAddress] = useState('');
  const [meetingPointLat, setMeetingPointLat] = useState<number | ''>('');
  const [meetingPointLng, setMeetingPointLng] = useState<number | ''>('');
  const [isActive, setIsActive] = useState(false);

  const [mediaItems, setMediaItems] = useState<Array<{ path: string; url: string }>>([]);
  const [primaryPath, setPrimaryPath] = useState<string>('');

  const resetForm = () => {
    setEditingId(null);
    setDestinationId('');
    setName('');
    setSlug('');
    setAbout('');
    setWhatYoullSee('');
    setItinerary('');
    setWhatsIncluded('');
    setWhatsNotIncluded('');
    setWhatToExpect('');
    setMeetingAndPickup('');
    setAccessibility('');
    setAdditionalInformation('');
    setCancellationPolicy('');
    setHelp('');
    setDuration('');
    setPrice('');
    setCurrency('EUR');
    setLanguagesText('');
    setGroupSizeMax('');
    setMinAge('');
    setLocationName('');
    setMeetingPointName('');
    setMeetingPointAddress('');
    setMeetingPointLat('');
    setMeetingPointLng('');
    setIsActive(false);
    setMediaItems([]);
    setPrimaryPath('');
  };

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch('/admin/packages', { headers: authHeader(token) });
      setItems(data.packages || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadDestinations = async () => {
    setDestinationsLoading(true);
    try {
      const data = await apiFetch('/admin/destinations', { headers: authHeader(token) });
      setDestinations(data.destinations || []);
    } catch (e) {
      setError((prev) => prev || (e as Error).message);
    } finally {
      setDestinationsLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadDestinations();
  }, []);

  const onEdit = (p: PackageRow) => {
    setEditingId(p.id);
    setDestinationId(String(p.destination_id || ''));
    setName(p.name || '');
    setSlug(p.slug || '');
    setAbout(String(p.about || ''));
    setWhatYoullSee(String(p.what_youll_see || ''));
    setItinerary(String(p.itinerary || ''));
    setWhatsIncluded(String(p.whats_included || ''));
    setWhatsNotIncluded(String(p.whats_not_included || ''));
    setWhatToExpect(String(p.what_to_expect || ''));
    setMeetingAndPickup(String(p.meeting_and_pickup || ''));
    setAccessibility(String(p.accessibility || ''));
    setAdditionalInformation(String(p.additional_information || ''));
    setCancellationPolicy(String(p.cancellation_policy || ''));
    setHelp(String(p.help || ''));

    setDuration(String(p.duration || ''));
    setPrice(String(p.price || ''));
    setCurrency(p.currency || 'EUR');
    setLanguagesText(Array.isArray(p.languages) ? p.languages.filter(Boolean).join(', ') : '');
    setGroupSizeMax(p.group_size_max ?? '');
    setMinAge(p.min_age ?? '');
    setLocationName(String(p.location_name || ''));
    setMeetingPointName(String(p.meeting_point_name || ''));
    setMeetingPointAddress(String(p.meeting_point_address || ''));
    setMeetingPointLat(p.meeting_point_lat ?? '');
    setMeetingPointLng(p.meeting_point_lng ?? '');
    setIsActive(Boolean(p.is_active));

    if (Array.isArray(p.media_paths) && Array.isArray(p.media_urls) && p.media_paths.length) {
      setMediaItems(p.media_paths.map((path, idx) => ({ path: String(path), url: String(p.media_urls?.[idx] || '') })));
      setPrimaryPath(String(p.media_paths[0] || ''));
    } else {
      setMediaItems([]);
      setPrimaryPath('');
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this package?')) return;

    setError(null);
    try {
      await apiFetch(`/admin/packages/${id}`, { method: 'DELETE', headers: authHeader(token) });
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

    let nextPrimary = primaryPath;

    for (const file of files) {
      const sign = await apiFetch('/admin/uploads/sign', {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify({ folder: 'packages', contentType: file.type }),
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

      if (!nextPrimary) {
        nextPrimary = path;
        setPrimaryPath(path);
      }
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const rawPaths = mediaItems.map((m) => m.path).filter(Boolean);
    const primary = primaryPath || rawPaths[0] || '';
    const deduped = Array.from(new Set(rawPaths));
    const ordered = primary ? [primary, ...deduped.filter((p) => p !== primary)] : deduped;

    const languages = languagesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      destination_id: destinationId,
      name,
      slug: slug || undefined,
      about: about || null,
      what_youll_see: whatYoullSee || null,
      itinerary: itinerary || null,
      whats_included: whatsIncluded || null,
      whats_not_included: whatsNotIncluded || null,
      what_to_expect: whatToExpect || null,
      meeting_and_pickup: meetingAndPickup || null,
      accessibility: accessibility || null,
      additional_information: additionalInformation || null,
      cancellation_policy: cancellationPolicy || null,
      help: help || null,
      duration: duration || null,
      price: price || null,
      currency,
      languages,
      group_size_max: groupSizeMax === '' ? null : Number(groupSizeMax),
      min_age: minAge === '' ? null : Number(minAge),
      location_name: locationName || null,
      meeting_point_name: meetingPointName || null,
      meeting_point_address: meetingPointAddress || null,
      meeting_point_lat: meetingPointLat === '' ? null : Number(meetingPointLat),
      meeting_point_lng: meetingPointLng === '' ? null : Number(meetingPointLng),
      media_urls: ordered,
      is_active: isActive,
    };

    try {
      if (editingId) {
        await apiFetch(`/admin/packages/${editingId}`, {
          method: 'PUT',
          headers: authHeader(token),
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/admin/packages', {
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

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Packages</h1>
            <p className="mt-1 text-gray-600">Manage packages.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50">
              Refresh
            </button>
            <button onClick={resetForm} className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50" type="button">
              New
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
        )}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={onSubmit} className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="text-sm font-semibold text-gray-900">{editingId ? 'Edit Package' : 'Create Package'}</div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Destination *</label>

                {destinationsLoading ? (
                  <div className="mt-2 text-sm text-gray-600">Loading destinations…</div>
                ) : destinations.length === 0 ? (
                  <div className="mt-2 rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    You need to create a destination first.
                    <div className="mt-2">
                      <Link to="/admin/destinations" className="text-red-700 underline">
                        Go to Admin Destinations
                      </Link>
                    </div>
                  </div>
                ) : (
                  <select
                    value={destinationId}
                    onChange={(e) => setDestinationId(e.target.value)}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    required
                  >
                    <option value="" disabled>
                      Select destination…
                    </option>
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.region}){d.is_active ? '' : ' [inactive]'}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" required />
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
                <label className="block text-sm font-medium text-gray-700">About</label>
                <textarea value={about} onChange={(e) => setAbout(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" rows={3} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">What you'll see</label>
                <textarea value={whatYoullSee} onChange={(e) => setWhatYoullSee(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" rows={3} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Itinerary</label>
                <textarea value={itinerary} onChange={(e) => setItinerary(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" rows={4} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">What's included</label>
                <textarea value={whatsIncluded} onChange={(e) => setWhatsIncluded(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" rows={3} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">What's not included</label>
                <textarea value={whatsNotIncluded} onChange={(e) => setWhatsNotIncluded(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" rows={3} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">What to expect</label>
                <textarea value={whatToExpect} onChange={(e) => setWhatToExpect(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" rows={3} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Meeting and pickup</label>
                <textarea value={meetingAndPickup} onChange={(e) => setMeetingAndPickup(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" rows={3} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Accessibility</label>
                <textarea value={accessibility} onChange={(e) => setAccessibility(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" rows={2} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Additional information</label>
                <textarea value={additionalInformation} onChange={(e) => setAdditionalInformation(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" rows={3} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Cancellation policy</label>
                <textarea value={cancellationPolicy} onChange={(e) => setCancellationPolicy(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" rows={2} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Help</label>
                <textarea value={help} onChange={(e) => setHelp(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" rows={2} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration</label>
                  <input
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    placeholder="e.g. 7-8 hours"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    placeholder="e.g. 120 EUR or 120"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Currency</label>
                <input value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Languages (comma-separated)</label>
                <input value={languagesText} onChange={(e) => setLanguagesText(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" placeholder="English, Albanian" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max group size</label>
                  <input
                    value={groupSizeMax}
                    onChange={(e) => setGroupSizeMax(e.target.value === '' ? '' : Number(e.target.value))}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    type="number"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Min age</label>
                  <input
                    value={minAge}
                    onChange={(e) => setMinAge(e.target.value === '' ? '' : Number(e.target.value))}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    type="number"
                    min={0}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Location name</label>
                <input value={locationName} onChange={(e) => setLocationName(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Meeting point name</label>
                <input value={meetingPointName} onChange={(e) => setMeetingPointName(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Meeting point address</label>
                <input value={meetingPointAddress} onChange={(e) => setMeetingPointAddress(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Meeting point lat</label>
                  <input
                    value={meetingPointLat}
                    onChange={(e) => setMeetingPointLat(e.target.value === '' ? '' : Number(e.target.value))}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    type="number"
                    step="any"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Meeting point lng</label>
                  <input
                    value={meetingPointLng}
                    onChange={(e) => setMeetingPointLng(e.target.value === '' ? '' : Number(e.target.value))}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    type="number"
                    step="any"
                  />
                </div>
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

                {mediaItems.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {mediaItems.map((m) => (
                      <button
                        key={m.path}
                        type="button"
                        onClick={() => setPrimaryPath(m.path)}
                        className={m.path === primaryPath ? 'rounded-lg overflow-hidden border-2 border-red-700 bg-gray-50' : 'rounded-lg overflow-hidden border bg-gray-50 hover:border-gray-300'}
                      >
                        {isVideoUrl(m.url) ? <video src={m.url} className="w-full h-20 object-cover" /> : <img src={m.url} alt="" className="w-full h-20 object-cover" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-end gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                  Active
                </label>
              </div>

              <button className="w-full rounded-md bg-red-700 text-white py-2 text-sm font-medium hover:bg-red-600" type="submit">
                {editingId ? 'Save changes' : 'Create package'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900">Existing packages</div>
                {loading && <div className="text-sm text-gray-500">Loading…</div>}
              </div>

              <div className="mt-4 space-y-3">
                {items.map((p) => {
                  const cover = String((p.media_urls && p.media_urls[0]) || '');
                  return (
                    <div key={p.id} className="rounded-xl border p-4 flex gap-4">
                      <div className="w-28 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {cover ? (
                          isVideoUrl(cover) ? (
                            <video src={cover} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                          ) : (
                            <img src={cover} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                          )
                        ) : (
                          <img src={'/placeholder.jpg'} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 truncate">{p.name}</div>
                            <div className="text-xs text-gray-500">/{p.slug}</div>
                            <div className="text-xs text-gray-500">Destination: {p.destination_id}</div>
                          </div>
                          <div className="flex flex-wrap items-center justify-end gap-2 sm:shrink-0">
                            <Link
                              to={`/admin/packages/${p.id}/availability`}
                              className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50 whitespace-nowrap"
                            >
                              Availability
                            </Link>
                            <button
                              onClick={() => onEdit(p)}
                              className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50 whitespace-nowrap"
                              type="button"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => onDelete(p.id)}
                              className="px-3 py-1.5 rounded-md bg-red-700 text-white text-sm hover:bg-red-600 whitespace-nowrap"
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 text-sm text-gray-600 line-clamp-2">{p.about || '—'}</div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">{p.is_active ? 'Active' : 'Inactive'}</span>
                          {Array.isArray(p.languages) && p.languages.length > 0 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">Languages: {p.languages.join(', ')}</span>
                          )}
                          {p.group_size_max !== null && p.group_size_max !== undefined && (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">Max group: {p.group_size_max}</span>
                          )}
                          {p.min_age !== null && p.min_age !== undefined && (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">Min age: {p.min_age}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {items.length === 0 && !loading && (
                  <div className="rounded-xl border bg-gray-50 p-8 text-center text-gray-600">No packages yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
