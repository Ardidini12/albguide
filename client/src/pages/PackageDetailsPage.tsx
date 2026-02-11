import { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch, authHeader } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { AvailabilityCalendar } from '../components/AvailabilityCalendar';
import { format } from 'date-fns';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type PackageRow = {
  id: string;
  destination_id: string;
  name: string;
  slug: string;
  about: string | null;
  what_youll_see: string | null;
  itinerary: string | null;
  whats_included: string | null;
  whats_not_included: string | null;
  what_to_expect: string | null;
  meeting_and_pickup: string | null;
  accessibility: string | null;
  additional_information: string | null;
  cancellation_policy: string | null;
  help: string | null;
  duration: string | null;
  price: string | null;
  currency: string;
  media_urls?: string[];
  is_active: boolean;
  destination_name?: string;
  destination_slug?: string;
  destination_region?: string;
  destination_is_active?: boolean;
};

type AvailabilityRule = {
  id: string;
  package_id: string;
  availability_type: 'always' | 'date_range' | 'specific_dates' | 'always_except';
  start_date?: string | null;
  end_date?: string | null;
  excluded_weekdays?: number[];
  specific_dates?: string[];
  is_open: boolean;
};

type ReviewRow = {
  id: string;
  booking_id: string;
  user_id: string;
  package_id: string;
  rating: number;
  title: string | null;
  body: string;
  moderation_status: string;
  created_at: string;
  user_name?: string | null;
  user_email?: string;
  images?: Array<{ url: string; path: string; file_type: string; file_size: number; created_at: string }>;
};

function isVideoUrl(url: string) {
  const clean = url.split('?')[0]?.toLowerCase() ?? '';
  return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.mov') || clean.endsWith('.m4v');
}

function formatPrice(price: string | null, currency: string) {
  const v = String(price || '').trim();
  if (!v) return null;
  if (/[a-zA-Z]/.test(v)) return v;
  return currency ? `${v} ${currency}` : v;
}

export function PackageDetailsPage() {
  const { slug } = useParams();
  const { token, user } = useAuth();

  const [pkg, setPkg] = useState<PackageRow | null>(null);
  const [availability, setAvailability] = useState<AvailabilityRule | null>(null);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date; to?: Date } | undefined>();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mediaIndex, setMediaIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [favorite, setFavorite] = useState<boolean | null>(null);

  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [adults, setAdults] = useState<number | ''>('');
  const [children, setChildren] = useState<number | ''>('');
  const [infants, setInfants] = useState<number | ''>('');
  const [note, setNote] = useState('');
  const [bookingMsg, setBookingMsg] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const mediaUrls = useMemo(() => {
    const raw = (pkg?.media_urls && pkg.media_urls.filter(Boolean)) || [];
    return raw.length ? raw : [];
  }, [pkg?.media_urls]);

  const currentUrl = mediaUrls[mediaIndex] || '/placeholder.jpg';
  const isVideo = isVideoUrl(String(currentUrl));

  const price = formatPrice(pkg?.price ?? null, pkg?.currency || 'EUR');

  const loadAll = async () => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch(`/packages/slug/${encodeURIComponent(slug)}`);
      const next = data.package as PackageRow;
      setPkg(next);

      const [a, r] = await Promise.all([
        apiFetch(`/packages/${encodeURIComponent(next.id)}/availability`),
        apiFetch(`/packages/${encodeURIComponent(next.id)}/reviews`),
      ]);

      setAvailability(a.availability);
      setReviews(r.reviews || []);

      if (token) {
        const fav = await apiFetch('/favorites', { headers: authHeader(token) });
        const ids = new Set<string>((fav.favorites || []).map((x: any) => String(x.package_id)));
        setFavorite(ids.has(next.id));
      } else {
        setFavorite(null);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAll();
  }, [slug, token]);

  useLayoutEffect(() => {
    if (loading || !pkg) return;
    const ctx = gsap.context(() => {
      gsap.from('.reveal-item', {
        opacity: 0,
        y: 40,
        stagger: 0.1,
        duration: 1.2,
        ease: 'power4.out',
      });
    }, containerRef);
    return () => ctx.revert();
  }, [loading, pkg?.id]);

  useEffect(() => {
    setMediaIndex(0);
  }, [pkg?.id]);

  const goNext = () => {
    if (mediaUrls.length <= 1) return;
    setMediaIndex((prev) => (prev + 1) % mediaUrls.length);
  };

  const goPrev = () => {
    if (mediaUrls.length <= 1) return;
    setMediaIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length);
  };

  useEffect(() => {
    if (!mediaUrls.length || mediaUrls.length < 2) return;

    if (isVideo) {
      const el = videoRef.current;
      if (el) {
        el.currentTime = 0;
        const p = el.play();
        if (p && typeof (p as Promise<void>).catch === 'function') {
          (p as Promise<void>).catch(() => { });
        }
      }
      return;
    }

    const id = window.setInterval(() => {
      setMediaIndex((i) => (i + 1) % mediaUrls.length);
    }, 5000);

    return () => window.clearInterval(id);
  }, [isVideo, mediaUrls.length, mediaIndex, currentUrl]);

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkg) return;

    setBookingMsg(null);
    setBookingLoading(true);

    try {
      const idempotencyKey = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now());
      const data = await apiFetch('/bookings', {
        method: 'POST',
        headers: {
          ...authHeader(token),
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          package_id: pkg.id,
          date: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
          end_date: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
          full_name: fullName,
          whatsapp_number: whatsapp,
          adults: adults === '' ? 0 : adults,
          children: children === '' ? 0 : children,
          infants: infants === '' ? 0 : infants,
          note: note || undefined,
        }),
      });

      setBookingMsg(`Booking created. Status: ${String(data.booking?.status || '')}`);
    } catch (e2) {
      setBookingMsg((e2 as Error).message);
    } finally {
      setBookingLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!pkg) return;
    if (!token) return;

    try {
      const data = await apiFetch('/favorites/toggle', {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify({ package_id: pkg.id }),
      });
      setFavorite(Boolean(data.favorite));
    } catch {
    }
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-zinc-500 font-black uppercase italic tracking-widest animate-pulse">Loading Premium Experience…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="inline-block px-6 py-4 rounded-2xl border border-red-900/30 bg-red-950/20 text-red-500 font-bold italic">
            Error: {error}
          </div>
          <div className="mt-10">
            <Link to="/packages" className="text-sm font-black uppercase italic tracking-widest text-zinc-400 hover:text-white transition-colors">
              ← Back to packages
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="bg-black min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center text-zinc-500 font-bold uppercase tracking-widest">
          Package not found.
          <Link to="/packages" className="block mt-6 text-red-600 hover:underline">Back to packages</Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="bg-black min-h-screen text-zinc-100 selection:bg-red-600/30">
      <div className="max-w-6xl mx-auto px-4 py-12 lg:py-20">
        <Link to="/packages" className="reveal-item text-xs text-red-600 hover:text-white font-black uppercase italic tracking-widest transition-all inline-flex items-center gap-2 mb-8 group">
          <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span> Return to packages
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          <div className="lg:col-span-2 space-y-12">
            <div className="reveal-item rounded-[2.5rem] overflow-hidden border border-white/5 bg-zinc-950 shadow-3xl">
              <div className="bg-black">
                <div className="relative w-full aspect-video lg:aspect-[16/10] max-h-[80vh] group/media overflow-hidden">
                  {isVideo ? (
                    <video
                      key={currentUrl}
                      ref={videoRef}
                      src={String(currentUrl)}
                      controls
                      autoPlay
                      muted
                      playsInline
                      onEnded={() => {
                        if (mediaUrls.length > 1) goNext();
                      }}
                      className="w-full h-full object-cover bg-black saturate-[1.1] transition-transform duration-1000"
                    />
                  ) : (
                    <img
                      src={String(currentUrl)}
                      alt={pkg.name}
                      className="w-full h-full object-cover saturate-[1.1] transition-transform duration-1000"
                      decoding="async"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>

                  {mediaUrls.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={goPrev}
                        className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full w-12 h-12 bg-black/40 backdrop-blur-xl text-white flex items-center justify-center border border-white/10 hover:bg-red-600 hover:border-red-600 transition-all opacity-0 group-hover/media:opacity-100"
                        aria-label="Previous media"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={goNext}
                        className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full w-12 h-12 bg-black/40 backdrop-blur-xl text-white flex items-center justify-center border border-white/10 hover:bg-red-600 hover:border-red-600 transition-all opacity-0 group-hover/media:opacity-100"
                        aria-label="Next media"
                      >
                        →
                      </button>
                    </>
                  )}
                </div>
              </div>

              {mediaUrls.length > 1 && (
                <div className="px-6 py-6 bg-zinc-900/30 border-t border-white/5">
                  <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                    {mediaUrls.map((u, idx) => {
                      const thumbIsVideo = isVideoUrl(String(u));
                      return (
                        <button
                          key={`${u}-${idx}`}
                          type="button"
                          onClick={() => setMediaIndex(idx)}
                          className={
                            idx === mediaIndex
                              ? 'h-20 w-32 flex-shrink-0 rounded-2xl overflow-hidden border-2 border-red-600 bg-black shadow-[0_0_20px_rgba(220,38,38,0.3)]'
                              : 'h-20 w-32 flex-shrink-0 rounded-2xl overflow-hidden border border-white/5 bg-zinc-800 opacity-40 hover:opacity-100 transition-all'
                          }
                        >
                          {thumbIsVideo ? (
                            <video src={u} preload="none" className="w-full h-full object-cover" />
                          ) : (
                            <img src={u} alt="" className="w-full h-full object-cover" decoding="async" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="p-10 lg:p-14">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="space-y-4">
                    <h1 className="text-4xl lg:text-6xl font-black italic uppercase tracking-tighter leading-none text-white">{pkg.name}</h1>
                    {pkg.destination_name && (
                      <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-red-600">
                        <span className="w-8 h-px bg-red-600"></span>
                        {pkg.destination_name}{pkg.destination_region ? ` / ${pkg.destination_region}` : ''}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-4">
                    {price && (
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Starting From</p>
                        <p className="text-4xl font-black italic text-white leading-none">{price}</p>
                      </div>
                    )}
                    {token && (
                      <button
                        onClick={toggleFavorite}
                        className={
                          favorite
                            ? 'px-6 py-2 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-widest shadow-[0_0_30px_rgba(220,38,38,0.4)]'
                            : 'px-6 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:bg-white hover:text-black hover:border-white transition-all'
                        }
                        type="button"
                      >
                        {favorite ? '★ IN WISHLIST' : '☆ ADD TO WISHLIST'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-12 group">
                  <h3 className="text-xs font-black uppercase italic tracking-widest text-zinc-500 mb-4 px-3 border-l-2 border-red-600">The Experience</h3>
                  <p className="text-lg lg:text-xl text-zinc-300 leading-relaxed font-medium">{pkg.about}</p>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pkg.duration ? (
                    <div className="rounded-3xl border border-white/5 bg-white/5 p-8 group hover:bg-white/[0.08] transition-all">
                      <div className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-2">Duration</div>
                      <div className="text-2xl font-black italic uppercase tracking-tighter text-white">{pkg.duration}</div>
                    </div>
                  ) : null}

                  <div className="rounded-3xl border border-white/5 bg-white/5 p-8 group hover:bg-white/[0.08] transition-all">
                    <div className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-2">Instant Connect</div>
                    <div className="text-2xl font-black italic uppercase tracking-tighter text-white">WhatsApp Priority</div>
                  </div>
                </div>

                {pkg.itinerary && (
                  <div className="mt-12 rounded-3xl border border-white/5 bg-zinc-950/50 p-8 lg:p-10">
                    <h3 className="text-xs font-black uppercase italic tracking-widest text-zinc-500 mb-6 px-3 border-l-2 border-red-600">Journey Itinerary</h3>
                    <div className="text-zinc-300 whitespace-pre-wrap leading-relaxed font-medium">{pkg.itinerary}</div>
                  </div>
                )}

                {(pkg.whats_included || pkg.whats_not_included) && (
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {pkg.whats_included && (
                      <div className="rounded-3xl border border-zinc-500/10 bg-zinc-900/20 p-8">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-green-500 mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span> Included
                        </h3>
                        <div className="text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed font-medium">{pkg.whats_included}</div>
                      </div>
                    )}
                    {pkg.whats_not_included && (
                      <div className="rounded-3xl border border-zinc-500/10 bg-zinc-900/20 p-8">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span> Not Included
                        </h3>
                        <div className="text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed font-medium">{pkg.whats_not_included}</div>
                      </div>
                    )}
                  </div>
                )}

                {pkg.cancellation_policy && (
                  <div className="mt-8 rounded-3xl border border-white/5 bg-white/5 p-8">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Cancellation Policy</h3>
                    <div className="text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed font-medium italic">{pkg.cancellation_policy}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="reveal-item space-y-8">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Reviews</h2>
                {user ? (
                  <Link to="/user/bookings" className="px-6 py-2 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
                    Add Your Review
                  </Link>
                ) : (
                  <Link to="/login" className="text-xs font-bold uppercase tracking-widest text-red-600 hover:text-white transition-colors">
                    Sign in to review
                  </Link>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="p-10 rounded-[2.5rem] border border-white/5 bg-zinc-950 text-center text-zinc-500 font-bold italic">
                  The journey is waiting for its first chronicler.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reviews.map((r) => (
                    <div key={r.id} className="p-8 rounded-[2rem] border border-white/5 bg-zinc-950 hover:border-red-600/30 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < r.rating ? 'text-red-600' : 'text-zinc-800'}>★</span>
                          ))}
                        </div>
                        <span className="text-[10px] font-black text-zinc-600">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-lg font-black uppercase italic tracking-tighter text-white mb-2 leading-none group-hover:text-red-500 transition-colors">{r.title || 'Exceptional Journey'}</h4>
                      <p className="text-sm text-zinc-400 leading-relaxed font-medium mb-6 italic">"{r.body}"</p>

                      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/5">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-[10px] font-black uppercase tracking-tighter text-red-600">
                          {r.user_name?.[0] || 'V'}
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          {r.user_name || 'Verified Explorer'}
                        </div>
                      </div>

                      {Array.isArray(r.images) && r.images.length > 0 && (
                        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                          {r.images.map((media) => (
                            <div key={media.path} className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                              {media.file_type === 'video' ? (
                                <video src={media.url} className="w-full h-full object-cover" />
                              ) : (
                                <img src={media.url} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="reveal-item sticky top-32 space-y-6">
              <div className="rounded-[2.5rem] border border-white/5 bg-zinc-950 p-10 shadow-3xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[80px] rounded-full -mr-16 -mt-16"></div>

                <div className="relative z-10">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-8 leading-none">Secure Your Journey</h3>

                  {!availability || !availability.is_open ? (
                    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 text-center">
                      <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Enquire for Custom Dates</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="bg-black/40 rounded-3xl p-4 border border-white/5 backdrop-blur-sm">
                        <AvailabilityCalendar
                          availability={availability}
                          mode="range"
                          selectedDates={dateRange}
                          onDateSelect={(range) => setDateRange(range as { from: Date; to?: Date } | undefined)}
                          showInstructions={false}
                        />
                      </div>

                      {dateRange?.from && (
                        <div className="p-4 rounded-2xl bg-red-600/10 border border-red-600/20 text-center animate-in fade-in slide-in-from-bottom-2">
                          <p className="text-[10px] font-black uppercase text-red-600 tracking-widest leading-none mb-1">Active Selection</p>
                          <p className="text-sm font-black italic text-white tracking-tight">
                            {format(dateRange.from, 'MMM dd')} {dateRange.to ? `→ ${format(dateRange.to, 'MMM dd')}` : '(Pick end)'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <form onSubmit={submitBooking} className="mt-10 space-y-4">
                    {bookingMsg && (
                      <div className={`p-4 rounded-2xl text-xs font-bold leading-relaxed border ${bookingMsg.includes('created') ? 'bg-green-600/10 border-green-600/20 text-green-500' : 'bg-red-600/10 border-red-600/20 text-red-500'}`}>
                        {bookingMsg}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-4">Full Name</label>
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full h-12 rounded-2xl bg-zinc-900/50 border border-white/5 px-6 text-sm font-bold focus:border-red-600 focus:bg-zinc-900 transition-all"
                        required
                        placeholder="Explorer Name"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-4">WhatsApp</label>
                      <input
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="w-full h-12 rounded-2xl bg-zinc-900/50 border border-white/5 px-6 text-sm font-bold focus:border-red-600 focus:bg-zinc-900 transition-all"
                        placeholder="+355 ... ..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5 text-center">
                        <label className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">Adults</label>
                        <input
                          value={adults}
                          onChange={(e) => setAdults(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full h-12 rounded-2xl bg-zinc-900/50 border border-white/5 px-0 text-center text-sm font-black focus:border-red-600 transition-all"
                          type="number"
                          min={0}
                        />
                      </div>
                      <div className="space-y-1.5 text-center">
                        <label className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">Kids</label>
                        <input
                          value={children}
                          onChange={(e) => setChildren(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full h-12 rounded-2xl bg-zinc-900/50 border border-white/5 px-0 text-center text-sm font-black focus:border-red-600 transition-all"
                          type="number"
                          min={0}
                        />
                      </div>
                      <div className="space-y-1.5 text-center">
                        <label className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">Infants</label>
                        <input
                          value={infants}
                          onChange={(e) => setInfants(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full h-12 rounded-2xl bg-zinc-900/50 border border-white/5 px-0 text-center text-sm font-black focus:border-red-600 transition-all"
                          type="number"
                          min={0}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-4">Special Requests</label>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full rounded-2xl bg-zinc-900/50 border border-white/5 px-6 py-4 text-sm font-bold focus:border-red-600 focus:bg-zinc-900 transition-all resize-none"
                        rows={3}
                        placeholder="Dietary requirements, accessibility, etc."
                      />
                    </div>

                    <button
                      disabled={bookingLoading || !dateRange?.from || ((adults === '' || adults === 0) && (children === '' || children === 0) && (infants === '' || infants === 0))}
                      className="w-full h-14 rounded-2xl bg-red-600 text-white text-xs font-black uppercase italic tracking-[0.2em] shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:scale-[1.02] hover:bg-black hover:text-red-500 hover:border hover:border-red-600 transition-all duration-300 disabled:opacity-20 disabled:scale-100 disabled:grayscale mt-4"
                      type="submit"
                    >
                      {bookingLoading ? 'Processing Request…' : 'Finalize Selection'}
                    </button>
                  </form>

                  <p className="mt-6 text-[9px] text-zinc-600 font-bold uppercase tracking-widest text-center leading-relaxed">
                    A representative will contact you on WhatsApp to confirm details and finalize payment.
                  </p>
                </div>
              </div>

              <div className="p-8 rounded-[2rem] border border-white/5 bg-gradient-to-br from-zinc-900 to-black">
                <h4 className="text-xs font-black uppercase italic tracking-widest text-white mb-4">Premium Support</h4>
                <p className="text-xs text-zinc-500 leading-relaxed font-bold">Need a custom itinerary? Our travel experts are available for private consultations.</p>
                <Link to="/support" className="inline-block mt-4 text-[10px] font-black uppercase text-red-600 hover:text-white transition-colors">Start Conversation →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
