import { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { gsap } from 'gsap';
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
  const [meetingPointLat, setMeetingPointLat] = useState('');
  const [meetingPointLatError, setMeetingPointLatError] = useState<string | null>(null);
  const [meetingPointLng, setMeetingPointLng] = useState('');
  const [meetingPointLngError, setMeetingPointLngError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  const [mediaItems, setMediaItems] = useState<Array<{ path: string; url: string }>>([]);
  const [primaryPath, setPrimaryPath] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onChangeMeetingPointLat = (raw: string) => {
    setMeetingPointLat(raw);
    const v = raw.trim();
    if (!v) { setMeetingPointLatError(null); return; }
    const n = Number(v);
    if (!Number.isFinite(n)) { setMeetingPointLatError('Latitude must be a valid number.'); return; }
    if (n < -90 || n > 90) { setMeetingPointLatError('Latitude must be between -90 and 90.'); return; }
    setMeetingPointLatError(null);
  };

  const onChangeMeetingPointLng = (raw: string) => {
    setMeetingPointLng(raw);
    const v = raw.trim();
    if (!v) { setMeetingPointLngError(null); return; }
    const n = Number(v);
    if (!Number.isFinite(n)) { setMeetingPointLngError('Longitude must be a valid number.'); return; }
    if (n < -180 || n > 180) { setMeetingPointLngError('Longitude must be between -180 and 180.'); return; }
    setMeetingPointLngError(null);
  };

  const resetForm = () => {
    setEditingId(null); setDestinationId(''); setName(''); setSlug(''); setAbout('');
    setWhatYoullSee(''); setItinerary(''); setWhatsIncluded(''); setWhatsNotIncluded('');
    setWhatToExpect(''); setMeetingAndPickup(''); setAccessibility(''); setAdditionalInformation('');
    setCancellationPolicy(''); setHelp(''); setDuration(''); setPrice(''); setCurrency('EUR');
    setLanguagesText(''); setGroupSizeMax(''); setMinAge(''); setLocationName('');
    setMeetingPointName(''); setMeetingPointAddress(''); setMeetingPointLat(''); setMeetingPointLng('');
    setMeetingPointLatError(null); setMeetingPointLngError(null); setIsActive(false);
    setMediaItems([]); setPrimaryPath('');
  };

  const load = async () => {
    setError(null); setLoading(true);
    try {
      const data = await apiFetch('/admin/packages', { headers: authHeader(token) });
      setItems(data.packages || []);
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  const loadDestinations = async () => {
    setDestinationsLoading(true);
    try {
      const data = await apiFetch('/admin/destinations', { headers: authHeader(token) });
      setDestinations(data.destinations || []);
    } catch (e) { setError((prev) => prev || (e as Error).message); }
    finally { setDestinationsLoading(false); }
  };

  useEffect(() => { load(); loadDestinations(); }, []);

  useLayoutEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.from('.kinetic-header', { y: -50, opacity: 0, duration: 1, ease: 'power4.out' });
      gsap.from('.form-card', { x: -50, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 });
      gsap.from('.list-card', { x: 50, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.4 });
      gsap.from('.package-item', { y: 20, opacity: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out', delay: 0.6 });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  const onEdit = (p: PackageRow) => {
    setEditingId(p.id); setDestinationId(String(p.destination_id || '')); setName(p.name || '');
    setSlug(p.slug || ''); setAbout(String(p.about || '')); setWhatYoullSee(String(p.what_youll_see || ''));
    setItinerary(String(p.itinerary || '')); setWhatsIncluded(String(p.whats_included || ''));
    setWhatsNotIncluded(String(p.whats_not_included || '')); setWhatToExpect(String(p.what_to_expect || ''));
    setMeetingAndPickup(String(p.meeting_and_pickup || '')); setAccessibility(String(p.accessibility || ''));
    setAdditionalInformation(String(p.additional_information || '')); setCancellationPolicy(String(p.cancellation_policy || ''));
    setHelp(String(p.help || '')); setDuration(String(p.duration || '')); setPrice(String(p.price || ''));
    setCurrency(p.currency || 'EUR'); setLanguagesText(Array.isArray(p.languages) ? p.languages.filter(Boolean).join(', ') : '');
    setGroupSizeMax(p.group_size_max ?? ''); setMinAge(p.min_age ?? ''); setLocationName(String(p.location_name || ''));
    setMeetingPointName(String(p.meeting_point_name || '')); setMeetingPointAddress(String(p.meeting_point_address || ''));
    setMeetingPointLat(p.meeting_point_lat == null ? '' : String(p.meeting_point_lat));
    setMeetingPointLng(p.meeting_point_lng == null ? '' : String(p.meeting_point_lng));
    setMeetingPointLatError(null); setMeetingPointLngError(null); setIsActive(Boolean(p.is_active));

    if (Array.isArray(p.media_paths) && Array.isArray(p.media_urls) && p.media_paths.length) {
      setMediaItems(p.media_paths.map((path, idx) => ({ path: String(path), url: String(p.media_urls?.[idx] || '') })));
      setPrimaryPath(String(p.media_paths[0] || ''));
    } else {
      setMediaItems([]); setPrimaryPath('');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this package?')) return;
    setError(null);
    try {
      await apiFetch(`/admin/packages/${id}`, { method: 'DELETE', headers: authHeader(token) });
      await load();
      if (editingId === id) resetForm();
    } catch (e) { setError((e as Error).message); }
  };

  const deleteFromStorage = async (path: string) => {
    try {
      await apiFetch('/admin/uploads', { method: 'DELETE', headers: authHeader(token), body: JSON.stringify({ path }) });
    } catch (err) { console.error('Failed to delete from storage:', err); }
  };

  const onUpload = async (files: File[]) => {
    setError(null);
    if (!supabase) throw new Error('Invalid Supabase client config.');
    let nextPrimary = primaryPath;
    for (const file of files) {
      const sign = await apiFetch('/admin/uploads/sign', { method: 'POST', headers: authHeader(token), body: JSON.stringify({ folder: 'packages', contentType: file.type }) });
      const path = String(sign.path || ''); const uploadToken = String(sign.token || '');
      if (!path || !uploadToken) throw new Error('Upload signature response missing path/token');
      const { error: uploadError } = await supabase.storage.from(String(sign.bucket || '')).uploadToSignedUrl(path, uploadToken, file, { contentType: file.type });
      if (uploadError) throw new Error(uploadError.message);
      const read = await apiFetch('/admin/uploads/read-url', { method: 'POST', headers: authHeader(token), body: JSON.stringify({ path, expiresInSeconds: 3600 }) });
      const signedUrl = String(read.signedUrl || '');
      setMediaItems((prev) => [...prev, { path, url: signedUrl }]);
      if (!nextPrimary) { nextPrimary = path; setPrimaryPath(path); }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    const latRaw = meetingPointLat.trim(); const lngRaw = meetingPointLng.trim();
    let nextLatError: string | null = null; let nextLngError: string | null = null;
    if (latRaw) { const lat = Number(latRaw); if (!Number.isFinite(lat)) nextLatError = 'Invalid lat.'; else if (lat < -90 || lat > 90) nextLatError = 'Lat between -90/90.'; }
    if (lngRaw) { const lng = Number(lngRaw); if (!Number.isFinite(lng)) nextLngError = 'Invalid lng.'; else if (lng < -180 || lng > 180) nextLngError = 'Lng between -180/180.'; }
    setMeetingPointLatError(nextLatError); setMeetingPointLngError(nextLngError);
    if (nextLatError || nextLngError) { setError('Fix highlighted fields.'); return; }

    const rawPaths = mediaItems.map((m) => m.path).filter(Boolean);
    const primary = primaryPath || rawPaths[0] || '';
    const deduped = Array.from(new Set(rawPaths));
    const ordered = primary ? [primary, ...deduped.filter((p) => p !== primary)] : deduped;
    const languages = languagesText.split(',').map((s) => s.trim()).filter(Boolean);

    const payload = {
      destination_id: destinationId, name, slug: slug || undefined, about: about || null,
      what_youll_see: whatYoullSee || null, itinerary: itinerary || null, whats_included: whatsIncluded || null,
      whats_not_included: whatsNotIncluded || null, what_to_expect: whatToExpect || null, meeting_and_pickup: meetingAndPickup || null,
      accessibility: accessibility || null, additional_information: additionalInformation || null, cancellation_policy: cancellationPolicy || null,
      help: help || null, duration: duration || null, price: price || null, currency, languages,
      group_size_max: groupSizeMax === '' ? null : Number(groupSizeMax), min_age: minAge === '' ? null : Number(minAge),
      location_name: locationName || null, meeting_point_name: meetingPointName || null, meeting_point_address: meetingPointAddress || null,
      meeting_point_lat: latRaw ? Number(latRaw) : null, meeting_point_lng: lngRaw ? Number(lngRaw) : null,
      media_urls: ordered, is_active: isActive,
    };

    try {
      if (editingId) await apiFetch(`/admin/packages/${editingId}`, { method: 'PUT', headers: authHeader(token), body: JSON.stringify(payload) });
      else await apiFetch('/admin/packages', { method: 'POST', headers: authHeader(token), body: JSON.stringify(payload) });
      await load(); resetForm();
    } catch (e2) { setError((e2 as Error).message); }
  };

  return (
    <div ref={containerRef} className="bg-black min-h-screen pt-24 pb-12 px-4 selection:bg-red-600 font-sans text-zinc-100">
      <div className="max-w-[90rem] mx-auto">
        <div className="kinetic-header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12 border-b border-white/10 pb-8">
          <div>
            <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-red-600 mb-4 transition-colors uppercase tracking-widest">
              ← Back to Dashboard
            </Link>
            <h1 className="text-5xl md:text-7xl font-black italic uppercase text-white tracking-tighter">
              Manage <span className="text-red-600">Packages</span>
            </h1>
            <p className="mt-4 text-xl text-zinc-400 max-w-2xl border-l-4 border-red-600 pl-6">
              Create and edit travel packages.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={load} className="px-6 py-3 rounded-full border border-white/10 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-colors">Refresh</button>
            <button onClick={resetForm} className="px-6 py-3 rounded-full bg-red-600 text-white font-black uppercase italic tracking-widest text-xs hover:bg-red-700 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.4)]" type="button">New Package</button>
          </div>
        </div>

        {error && <div className="mb-8 rounded-xl border border-red-900/50 bg-red-950/30 px-6 py-4 text-sm font-bold text-red-200 animate-pulse">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 form-card">
            <form onSubmit={onSubmit} className="bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6 sticky top-24 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="text-2xl font-black italic uppercase text-white border-b border-white/5 pb-4">
                {editingId ? 'Edit Package' : 'Create Package'}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Destination *</label>
                {destinationsLoading ? (
                  <div className="text-zinc-500 animate-pulse text-xs font-bold uppercase">Loading...</div>
                ) : destinations.length === 0 ? (
                  <div className="text-red-500 text-xs font-bold uppercase">No destinations found. Create one first.</div>
                ) : (
                  <select value={destinationId} onChange={(e) => setDestinationId(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-red-600 focus:outline-none transition-colors" required>
                    <option value="" disabled>Select destination...</option>
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.region}){!d.is_active ? ' [Inactive]' : ''}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-red-600 focus:outline-none transition-colors placeholder-zinc-700" required />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Slug</label>
                <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-red-600 focus:outline-none transition-colors placeholder-zinc-700" placeholder="auto-generated" />
              </div>

              {/* Collapsible Sections or just simple textareas for now. Keeping it simple. */}
              {[{ l: 'About', v: about, s: setAbout }, { l: "What you'll see", v: whatYoullSee, s: setWhatYoullSee }, { l: 'Itinerary', v: itinerary, s: setItinerary }, { l: "What's Included", v: whatsIncluded, s: setWhatsIncluded }, { l: "What's Not Included", v: whatsNotIncluded, s: setWhatsNotIncluded }, { l: 'What to Expect', v: whatToExpect, s: setWhatToExpect }, { l: 'Meeting & Pickup', v: meetingAndPickup, s: setMeetingAndPickup }, { l: 'Accessibility', v: accessibility, s: setAccessibility }, { l: 'Additional Info', v: additionalInformation, s: setAdditionalInformation }, { l: 'Cancellation Policy', v: cancellationPolicy, s: setCancellationPolicy }, { l: 'Help', v: help, s: setHelp }].map(f => (
                <div key={f.l}>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{f.l}</label>
                  <textarea value={f.v} onChange={(e) => f.s(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:border-red-600 focus:outline-none transition-colors placeholder-zinc-700 resize-none" rows={3} />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Duration</label>
                  <input value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-red-600 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Price ({currency})</label>
                  <input value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-red-600 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Max Group Size</label>
                  <input type="number" value={groupSizeMax} onChange={(e) => setGroupSizeMax(e.target.value ? Number(e.target.value) : '')} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-red-600 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Min Age</label>
                  <input type="number" value={minAge} onChange={(e) => setMinAge(e.target.value ? Number(e.target.value) : '')} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-red-600 focus:outline-none transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Languages (comma-separated)</label>
                <input value={languagesText} onChange={(e) => setLanguagesText(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-red-600 focus:outline-none transition-colors" />
              </div>

              <div className="space-y-4 border-t border-white/10 pt-4">
                <div className="text-sm font-black italic uppercase text-white">Location & Meeting Point</div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Location Name</label>
                  <input value={locationName} onChange={(e) => setLocationName(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-red-600 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Meeting Point Name</label>
                  <input value={meetingPointName} onChange={(e) => setMeetingPointName(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-red-600 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Meeting Point Address</label>
                  <textarea value={meetingPointAddress} onChange={(e) => setMeetingPointAddress(e.target.value)} rows={2} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:border-red-600 focus:outline-none transition-colors resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Latitude</label>
                    <input value={meetingPointLat} onChange={(e) => onChangeMeetingPointLat(e.target.value)} className={`w-full bg-black border ${meetingPointLatError ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white font-bold focus:border-red-600 focus:outline-none transition-colors`} />
                    {meetingPointLatError && <div className="text-red-500 text-[10px] uppercase font-bold mt-1">{meetingPointLatError}</div>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Longitude</label>
                    <input value={meetingPointLng} onChange={(e) => onChangeMeetingPointLng(e.target.value)} className={`w-full bg-black border ${meetingPointLngError ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white font-bold focus:border-red-600 focus:outline-none transition-colors`} />
                    {meetingPointLngError && <div className="text-red-500 text-[10px] uppercase font-bold mt-1">{meetingPointLngError}</div>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Media</label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-red-600/50 bg-black/50 transition-colors">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Click or Drop Files</span>
                  <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" multiple onChange={(e) => onUpload(Array.from(e.target.files || [])).catch(err => setError(err.message))} />
                </label>
                {mediaItems.length > 0 && <div className="mt-4 grid grid-cols-4 gap-2">
                  {mediaItems.map((m) => (
                    <div key={m.path} className={`relative aspect-square rounded overflow-hidden border ${m.path === primaryPath ? 'border-red-600' : 'border-white/10'} bg-black group`}>
                      {isVideoUrl(m.url) ? (
                        <video src={m.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" onClick={() => setPrimaryPath(m.path)} />
                      ) : (
                        <img src={m.url} className="w-full h-full object-cover" onClick={() => setPrimaryPath(m.path)} />
                      )}

                      <button type="button" onClick={(e) => { e.stopPropagation(); deleteFromStorage(m.path); setMediaItems(p => p.filter(i => i.path !== m.path)) }} className="absolute top-0 right-0 bg-red-600 text-white p-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">X</button>
                    </div>
                  ))}
                </div>}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="peer w-5 h-5 accent-red-600" />
                  <span className="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors uppercase tracking-wider">Active</span>
                </label>
              </div>

              <button className="w-full rounded-full bg-red-600 text-white py-4 text-sm font-black uppercase italic tracking-widest hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] transition-all" type="submit">
                {editingId ? 'Save Changes' : 'Create Package'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-3 list-card">
            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <div className="text-2xl font-black italic uppercase text-white">Existing Packages</div>
                {loading && <div className="text-sm font-bold text-zinc-500 animate-pulse">LOADING...</div>}
              </div>
              <div className="space-y-4">
                {items.map((p) => {
                  const cover = String((p.media_urls && p.media_urls[0]) || '');
                  return (
                    <div key={p.id} className="package-item group relative bg-black/50 border border-white/5 rounded-2xl p-4 flex gap-4 hover:border-red-600/30 hover:bg-black/80 transition-all duration-300">
                      <div className="w-32 h-24 rounded-xl bg-zinc-800 overflow-hidden flex-shrink-0 relative">
                        {isVideoUrl(cover) ? (
                          <video src={cover} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" muted playsInline />
                        ) : (
                          <img src={cover || '/placeholder.jpg'} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-black text-xl text-white truncate group-hover:text-red-500 transition-colors uppercase italic tracking-tight">{p.name}</h3>
                            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mt-1">/{p.slug}</div>
                          </div>
                          <div className="flex gap-2">
                            <Link to={`/admin/packages/${p.id}/availability`} className="px-3 py-1.5 rounded-lg border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-white/10">Availability</Link>
                            <button onClick={() => onEdit(p)} className="px-3 py-1.5 rounded-lg border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-white/10">Edit</button>
                            <button onClick={() => onDelete(p.id)} className="px-3 py-1.5 rounded-lg bg-red-900/30 text-red-500 text-[10px] font-bold uppercase tracking-wider hover:bg-red-900/50">Delete</button>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${p.is_active ? 'border-green-900/50 text-green-500 bg-green-900/10' : 'border-zinc-700 text-zinc-500 bg-zinc-900'}`}>{p.is_active ? 'Active' : 'Inactive'}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
