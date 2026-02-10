import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/api';

type PackageRow = {
  id: string;
  destination_id: string;
  name: string;
  slug: string;
  about: string | null;
  duration: string | null;
  price: string | null;
  currency: string;
  media_urls?: string[];
  is_active: boolean;
  created_at: string;
  destination_name?: string;
  destination_slug?: string;
  destination_region?: string;
};

function formatPrice(price: string | null, currency: string) {
  const v = String(price || '').trim();
  if (!v) return null;
  if (/[a-zA-Z]/.test(v)) return v;
  return currency ? `${v} ${currency}` : v;
}

function isVideoUrl(url: string) {
  const clean = url.split('?')[0]?.toLowerCase() ?? '';
  return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.mov') || clean.endsWith('.m4v');
}

export function PackagesPage() {
  const [items, setItems] = useState<PackageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeMediaIndexById, setActiveMediaIndexById] = useState<Record<string, number>>({});
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch('/packages');
      setItems(data.packages || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  }, [items]);

  const pauseAndReset = (el: HTMLVideoElement | null) => {
    if (!el) return;
    try {
      el.pause();
      el.currentTime = 0;
    } catch {
    }
  };

  const playPreview = (id: string) => {
    for (const [otherId, otherEl] of Object.entries(videoRefs.current)) {
      if (otherId !== id) pauseAndReset(otherEl);
    }

    const el = videoRefs.current[id];
    if (!el) return;

    try {
      el.muted = true;
      el.currentTime = 0;
      const p = el.play();
      if (p && typeof (p as Promise<void>).catch === 'function') {
        (p as Promise<void>).catch(() => {});
      }
    } catch {
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-serif">Packages</h1>
          <p className="mt-2 text-white/90 max-w-2xl">Choose a tour, check availability, and book in seconds.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-gray-600">Loading…</div>
        ) : sorted.length === 0 ? (
          <div className="rounded-2xl border bg-white p-8 text-gray-600">No packages yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sorted.map((p) => {
              const media = Array.isArray(p.media_urls) ? p.media_urls.filter(Boolean) : [];
              const activeIndex = Math.min(activeMediaIndexById[p.id] ?? 0, Math.max(media.length - 1, 0));
              const activeUrl = media[activeIndex] || '';
              const price = formatPrice(p.price ?? null, p.currency);

              const setIndex = (next: number) => {
                if (media.length <= 1) return;
                const safe = ((next % media.length) + media.length) % media.length;
                setActiveMediaIndexById((prev) => ({ ...prev, [p.id]: safe }));

                const nextUrl = media[safe] || '';
                if (hoveredId === p.id && nextUrl && isVideoUrl(nextUrl)) {
                  window.setTimeout(() => playPreview(p.id), 0);
                }
              };

              const onControlClick = (e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
              };

              return (
                <Link
                  key={p.id}
                  to={`/packages/${p.slug}`}
                  className="group rounded-2xl overflow-hidden border bg-white hover:shadow-lg transition-shadow"
                  onMouseEnter={() => {
                    setHoveredId(p.id);
                    if (activeUrl && isVideoUrl(activeUrl)) playPreview(p.id);
                  }}
                  onMouseLeave={() => {
                    setHoveredId((prev) => (prev === p.id ? null : prev));
                    pauseAndReset(videoRefs.current[p.id]);
                  }}
                >
                  <div className="relative h-56 bg-gray-100 overflow-hidden">
                    {activeUrl ? (
                      isVideoUrl(activeUrl) ? (
                        <video
                          key={activeUrl}
                          ref={(el) => {
                            videoRefs.current[p.id] = el;
                          }}
                          src={activeUrl}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          playsInline
                          preload="none"
                          muted
                        />
                      ) : (
                        <img
                          src={activeUrl}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      )
                    ) : (
                      <img
                        src={'/placeholder.jpg'}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    )}

                    {media.length > 1 && (
                      <>
                        <button
                          type="button"
                          aria-label="Previous media"
                          className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 text-white hover:bg-black/55 flex items-center justify-center"
                          onClick={(e) => {
                            onControlClick(e);
                            setIndex(activeIndex - 1);
                          }}
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          aria-label="Next media"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 text-white hover:bg-black/55 flex items-center justify-center"
                          onClick={(e) => {
                            onControlClick(e);
                            setIndex(activeIndex + 1);
                          }}
                        >
                          ›
                        </button>

                        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                          {media.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              aria-label={`Go to media ${idx + 1}`}
                              className={
                                idx === activeIndex
                                  ? 'h-2 w-2 rounded-full bg-white'
                                  : 'h-2 w-2 rounded-full bg-white/60 hover:bg-white/80'
                              }
                              onClick={(e) => {
                                onControlClick(e);
                                setIndex(idx);
                              }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="text-xl font-semibold text-gray-900 truncate">{p.name}</h2>
                        {p.destination_name && (
                          <div className="mt-1 text-xs text-gray-500">
                            {p.destination_name}
                            {p.destination_region ? ` • ${p.destination_region}` : ''}
                          </div>
                        )}
                      </div>

                      {price && (
                        <div className="text-sm font-semibold text-red-700 whitespace-nowrap">{price}</div>
                      )}
                    </div>

                    {p.about && <p className="mt-2 text-gray-600 line-clamp-3">{p.about}</p>}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {p.duration ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">{p.duration}</span>
                      ) : null}
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                        Bookable
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
