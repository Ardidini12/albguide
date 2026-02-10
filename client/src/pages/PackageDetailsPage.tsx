import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch, authHeader } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { AvailabilityCalendar, countAvailableDays } from '../components/AvailabilityCalendar';
import { format } from 'date-fns';

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

  useEffect(() => {
    loadAll();
  }, [slug, token]);

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
          (p as Promise<void>).catch(() => {});
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
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-10 text-gray-600">Loading…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
          <Link to="/packages" className="inline-block mt-6 text-sm text-red-700 hover:underline">
            Back to packages
          </Link>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="rounded-2xl border bg-white p-8 text-gray-700">Package not found.</div>
          <Link to="/packages" className="inline-block mt-6 text-sm text-red-700 hover:underline">
            Back to packages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Link to="/packages" className="text-sm text-red-700 hover:underline">← Back to packages</Link>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="rounded-2xl overflow-hidden border bg-white">
              <div className="bg-gray-100">
                <div className="relative w-full aspect-video max-h-[70vh]">
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
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : (
                    <img
                      src={String(currentUrl)}
                      alt={pkg.name}
                      className="w-full h-full object-contain"
                      decoding="async"
                    />
                  )}

                  {mediaUrls.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={goPrev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm border hover:bg-white"
                        aria-label="Previous media"
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        onClick={goNext}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm border hover:bg-white"
                        aria-label="Next media"
                      >
                        Next
                      </button>
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                        {mediaUrls.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            aria-label={`Go to media ${idx + 1}`}
                            className={idx === mediaIndex ? 'h-2 w-2 rounded-full bg-white' : 'h-2 w-2 rounded-full bg-white/60 hover:bg-white/80'}
                            onClick={() => setMediaIndex(idx)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {mediaUrls.length > 1 && (
                <div className="p-3 bg-white border-t">
                  <div className="flex gap-2 overflow-x-auto">
                    {mediaUrls.map((u, idx) => {
                      const thumbIsVideo = isVideoUrl(String(u));
                      return (
                        <button
                          key={`${u}-${idx}`}
                          type="button"
                          onClick={() => setMediaIndex(idx)}
                          className={
                            idx === mediaIndex
                              ? 'h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden border-2 border-purple-700 bg-gray-100'
                              : 'h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden border bg-gray-100 hover:border-gray-300'
                          }
                        >
                          {thumbIsVideo ? (
                            <video src={u} className="w-full h-full object-cover" />
                          ) : (
                            <img src={u} alt="" className="w-full h-full object-cover" decoding="async" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="p-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h1 className="text-3xl font-semibold text-gray-900">{pkg.name}</h1>
                    {pkg.destination_name && (
                      <div className="mt-1 text-sm text-gray-600">
                        {pkg.destination_name}
                        {pkg.destination_region ? ` • ${pkg.destination_region}` : ''}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {price && <div className="text-lg font-bold text-red-700">{price}</div>}
                    {token && (
                      <button
                        onClick={toggleFavorite}
                        className={
                          favorite
                            ? 'px-3 py-2 rounded-md bg-red-700 text-white text-sm hover:bg-red-600'
                            : 'px-3 py-2 rounded-md border text-sm hover:bg-gray-50'
                        }
                        type="button"
                      >
                        {favorite ? 'Saved' : 'Save'}
                      </button>
                    )}
                  </div>
                </div>

                {pkg.about && <p className="mt-4 text-gray-700 leading-relaxed">{pkg.about}</p>}

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pkg.duration ? (
                    <div className="rounded-xl border p-4">
                      <div className="text-sm text-gray-500">Duration</div>
                      <div className="mt-1 font-semibold text-gray-900">{pkg.duration}</div>
                    </div>
                  ) : null}

                  <div className="rounded-xl border p-4">
                    <div className="text-sm text-gray-500">Booking</div>
                    <div className="mt-1 font-semibold text-gray-900">WhatsApp confirmation</div>
                  </div>
                </div>

                {pkg.itinerary && (
                  <div className="mt-8 rounded-xl border p-4">
                    <div className="font-semibold text-gray-900">Itinerary</div>
                    <div className="mt-2 text-gray-700 whitespace-pre-wrap">{pkg.itinerary}</div>
                  </div>
                )}

                {(pkg.whats_included || pkg.whats_not_included) && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pkg.whats_included && (
                      <div className="rounded-xl border p-4">
                        <div className="font-semibold text-gray-900">What’s included</div>
                        <div className="mt-2 text-gray-700 whitespace-pre-wrap">{pkg.whats_included}</div>
                      </div>
                    )}
                    {pkg.whats_not_included && (
                      <div className="rounded-xl border p-4">
                        <div className="font-semibold text-gray-900">Not included</div>
                        <div className="mt-2 text-gray-700 whitespace-pre-wrap">{pkg.whats_not_included}</div>
                      </div>
                    )}
                  </div>
                )}

                {pkg.cancellation_policy && (
                  <div className="mt-6 rounded-xl border p-4">
                    <div className="font-semibold text-gray-900">Cancellation policy</div>
                    <div className="mt-2 text-gray-700 whitespace-pre-wrap">{pkg.cancellation_policy}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border bg-white p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="text-lg font-semibold text-gray-900">Reviews</div>
                {user ? (
                  <Link to="/user/bookings" className="text-sm text-red-700 hover:underline">
                    Leave a review from your bookings
                  </Link>
                ) : (
                  <Link to="/login" className="text-sm text-red-700 hover:underline">
                    Login to review
                  </Link>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="mt-4 text-sm text-gray-600">No reviews yet.</div>
              ) : (
                <div className="mt-4 space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="rounded-xl border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {r.title || 'Review'}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {r.user_name || (r.user_email ? r.user_email.split('@')[0] : 'Traveler')} • {new Date(r.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-yellow-700">{r.rating}/5</div>
                      </div>
                      <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{r.body}</div>

                      {Array.isArray(r.images) && r.images.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                          {r.images.map((media) => (
                            media.file_type === 'video' ? (
                              <video
                                key={media.path}
                                src={media.url}
                                controls
                                className="h-24 w-full object-cover rounded-lg border bg-black"
                                preload="metadata"
                              />
                            ) : (
                              <img
                                key={media.path}
                                src={media.url}
                                alt=""
                                className="h-24 w-full object-cover rounded-lg border"
                                loading="lazy"
                              />
                            )
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
            <div className="rounded-2xl border bg-white p-6">
              <div className="text-lg font-semibold text-gray-900 mb-4">Check Availability</div>
              {!availability || !availability.is_open ? (
                <div className="text-sm text-gray-600">No availability published.</div>
              ) : (
                <div>
                  <AvailabilityCalendar
                    availability={availability}
                    mode="range"
                    selectedDates={dateRange}
                    onDateSelect={(range) => setDateRange(range as { from: Date; to?: Date } | undefined)}
                    showInstructions={true}
                  />
                  {dateRange?.from && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-700">
                        {dateRange.to ? (
                          <>
                            <strong>Selected:</strong> {format(dateRange.from, 'MMM dd, yyyy')} - {format(dateRange.to, 'MMM dd, yyyy')}
                            <span className="ml-2 text-gray-600">
                              ({countAvailableDays(availability, dateRange.from, dateRange.to)} available day{countAvailableDays(availability, dateRange.from, dateRange.to) !== 1 ? 's' : ''})
                            </span>
                          </>
                        ) : (
                          <><strong>Start date:</strong> {format(dateRange.from, 'MMM dd, yyyy')} <span className="text-gray-600">(Click end date)</span></>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={submitBooking} className="mt-6 space-y-3">
                <div className="text-lg font-semibold text-gray-900">Book</div>

                {bookingMsg && (
                  <div className="rounded-lg border px-3 py-2 text-sm">
                    {bookingMsg}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Booking Date(s) *</label>
                  <input
                    value={dateRange?.from ? (dateRange.to ? `${format(dateRange.from, 'yyyy-MM-dd')} to ${format(dateRange.to, 'yyyy-MM-dd')}` : format(dateRange.from, 'yyyy-MM-dd')) : ''}
                    readOnly
                    className="mt-1 w-full rounded-md border px-3 py-2 bg-gray-50"
                    placeholder="Select dates from calendar above"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Full name *</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">WhatsApp (with country code) *</label>
                  <input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    placeholder="+355..."
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Adults</label>
                    <input
                      value={adults}
                      onChange={(e) => setAdults(e.target.value === '' ? '' : Number(e.target.value))}
                      className="mt-1 w-full rounded-md border px-3 py-2"
                      type="number"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Children</label>
                    <input
                      value={children}
                      onChange={(e) => setChildren(e.target.value === '' ? '' : Number(e.target.value))}
                      className="mt-1 w-full rounded-md border px-3 py-2"
                      type="number"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Infants</label>
                    <input
                      value={infants}
                      onChange={(e) => setInfants(e.target.value === '' ? '' : Number(e.target.value))}
                      className="mt-1 w-full rounded-md border px-3 py-2"
                      type="number"
                      min={0}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Note</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    rows={3}
                  />
                </div>

                <button
                  disabled={bookingLoading || ((adults === '' || adults === 0) && (children === '' || children === 0) && (infants === '' || infants === 0))}
                  className="w-full rounded-md bg-red-700 text-white py-2 text-sm font-medium hover:bg-red-600 disabled:opacity-50"
                  type="submit"
                >
                  {bookingLoading ? 'Creating…' : 'Request Booking'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
