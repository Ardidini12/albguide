import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/api';

type Destination = {
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

function isVideoUrl(url: string) {
  const clean = url.split('?')[0]?.toLowerCase() ?? '';
  return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.mov') || clean.endsWith('.m4v');
}

export function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [region, setRegion] = useState<string>('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeMediaIndexById, setActiveMediaIndexById] = useState<Record<string, number>>({});
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch('/destinations');
      setDestinations(data.destinations || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const regions = useMemo(() => {
    const uniq = new Set<string>();
    for (const d of destinations) {
      if (d.region) uniq.add(d.region);
    }
    return ['All', ...Array.from(uniq).sort()];
  }, [destinations]);

  const filtered = useMemo(() => {
    if (region === 'All') return destinations;
    return destinations.filter((d) => d.region === region);
  }, [destinations, region]);

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
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-serif">Destinations</h1>
          <p className="mt-2 text-white/90 max-w-2xl">
            Explore regions, discover destinations, and plan your adventure.
          </p>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap gap-2">
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={
                r === region
                  ? 'px-3 py-2 rounded-md bg-purple-700 text-white text-sm'
                  : 'px-3 py-2 rounded-md border text-sm hover:bg-gray-50'
              }
            >
              {r}
            </button>
          ))}
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
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border bg-white p-8 text-gray-600">No destinations yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((d) => (
              (() => {
                const media = (d.media_urls && d.media_urls.length > 0)
                  ? d.media_urls
                  : d.image_url
                    ? [d.image_url]
                    : [];
                const activeIndex = Math.min(activeMediaIndexById[d.id] ?? 0, Math.max(media.length - 1, 0));
                const activeUrl = media[activeIndex] || '';
                const bullets = (d.highlights && d.highlights.length > 0)
                  ? d.highlights
                  : d.activities && d.activities.length > 0
                    ? d.activities
                    : [];

                const setIndex = (next: number) => {
                  if (media.length <= 1) return;
                  const safe = ((next % media.length) + media.length) % media.length;
                  setActiveMediaIndexById((prev) => ({ ...prev, [d.id]: safe }));

                  const nextUrl = media[safe] || '';
                  if (hoveredId === d.id && nextUrl && isVideoUrl(nextUrl)) {
                    window.setTimeout(() => playPreview(d.id), 0);
                  }
                };

                const onControlClick = (e: MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                };

                return (
              <Link
                key={d.id}
                to={`/destinations/${d.slug}`}
                className="group rounded-2xl overflow-hidden border bg-white hover:shadow-lg transition-shadow"
                onMouseEnter={() => {
                  setHoveredId(d.id);
                  if (activeUrl && isVideoUrl(activeUrl)) playPreview(d.id);
                }}
                onMouseLeave={() => {
                  setHoveredId((prev) => (prev === d.id ? null : prev));
                  pauseAndReset(videoRefs.current[d.id]);
                }}
              >
                <div className="relative h-56 bg-gray-100 overflow-hidden">
                  {activeUrl ? (
                    isVideoUrl(activeUrl) ? (
                      <video
                        key={activeUrl}
                        ref={(el) => {
                          videoRefs.current[d.id] = el;
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
                        alt={d.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    )
                  ) : (
                    <img
                      src={'/placeholder.jpg'}
                      alt={d.name}
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
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold text-gray-900">{d.name}</h2>
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                      {d.region}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600 line-clamp-3">{d.description}</p>
                  {d.best_time && (
                    <div className="mt-4 text-sm text-gray-700">
                      <span className="font-medium">Best time:</span> {d.best_time}
                    </div>
                  )}

                  {bullets.length > 0 && (
                    <ul className="mt-4 list-disc pl-5 text-sm text-gray-700">
                      {bullets.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="leading-5">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Link>
                );
              })()
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
