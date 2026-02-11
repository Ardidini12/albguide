import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

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

  useLayoutEffect(() => {
    if (loading || destinations.length === 0) return;

    const ctx = gsap.context(() => {
      // Hero Animation
      if (heroRef.current) {
        gsap.from(heroRef.current.children, {
          opacity: 0,
          y: 30,
          stagger: 0.2,
          duration: 1.2,
          ease: 'power4.out',
        });
      }

      // Grid Animation
      const cards = gsap.utils.toArray('.destination-card');
      if (cards.length > 0) {
        gsap.from(cards, {
          opacity: 0,
          y: 60,
          scale: 0.95,
          stagger: 0.1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.destination-grid',
            start: 'top 85%',
            toggleActions: 'play none none none',
          }
        });
      }

      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, [loading, destinations]);

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
        (p as Promise<void>).catch(() => { });
      }
    } catch {
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-zinc-100 selection:bg-purple-600/30">
      {/* Hero Section */}
      <div ref={heroRef} className="relative py-24 md:py-32 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/40 via-black to-black z-0"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center md:text-left">
          <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none mb-6">
            MYSTICAL <span className="text-purple-500">ALBANIA</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl font-medium leading-relaxed border-l-4 border-purple-600 pl-6 mx-auto md:mx-0">
            Uncover the secrets of the Balkans. From ancient castles to hidden beaches.
          </p>
        </div>
      </div>

      {/* Region Filter */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4 overflow-x-auto no-scrollbar">
          <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] whitespace-nowrap">Filter By Region:</span>
          <div className="flex gap-2">
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${r === region
                  ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-white/5'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        {error && (
          <div className="mb-12 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-[450px] rounded-3xl bg-zinc-900/50 animate-pulse border border-white/5"></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/5 bg-zinc-900/30 p-12 text-center text-zinc-500 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-2">No destinations found.</h3>
            <p>Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="destination-grid grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
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
                    className="destination-card group bg-zinc-950 rounded-[2rem] overflow-hidden border border-white/10 hover:border-purple-600/50 transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:-translate-y-2 flex flex-col"
                    onMouseEnter={() => {
                      setHoveredId(d.id);
                      if (activeUrl && isVideoUrl(activeUrl)) playPreview(d.id);
                    }}
                    onMouseLeave={() => {
                      setHoveredId((prev) => (prev === d.id ? null : prev));
                      pauseAndReset(videoRefs.current[d.id]);
                    }}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {activeUrl ? (
                        isVideoUrl(activeUrl) ? (
                          <video
                            key={activeUrl}
                            ref={(el) => {
                              videoRefs.current[d.id] = el;
                            }}
                            src={activeUrl}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                            playsInline
                            preload="none"
                            muted
                          />
                        ) : (
                          <img
                            src={activeUrl}
                            alt={d.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                            loading="lazy"
                          />
                        )
                      ) : (
                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700">
                          <span className="text-4xl">📸</span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>

                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                          {d.region}
                        </span>
                        {d.is_featured && (
                          <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-lg">
                            Featured
                          </span>
                        )}
                      </div>

                      {media.length > 1 && (
                        <>
                          <button
                            type="button"
                            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-purple-600"
                            onClick={(e) => {
                              onControlClick(e);
                              setIndex(activeIndex - 1);
                            }}
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-purple-600"
                            onClick={(e) => {
                              onControlClick(e);
                              setIndex(activeIndex + 1);
                            }}
                          >
                            ›
                          </button>
                        </>
                      )}
                    </div>

                    <div className="p-8 flex flex-col flex-1">
                      <div className="mb-4">
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none">
                          {d.name}
                        </h2>
                      </div>

                      <p className="text-zinc-400 text-sm font-medium leading-relaxed mb-6 line-clamp-3">
                        {d.description}
                      </p>

                      {d.best_time && (
                        <div className="mb-6 flex items-center gap-2 text-zinc-500 bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-white/5">
                          <span className="text-xs uppercase font-black tracking-widest text-purple-400">Best Time:</span>
                          <span className="text-xs font-bold">{d.best_time}</span>
                        </div>
                      )}

                      <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-6">
                        <div className="flex gap-1 overflow-hidden">
                          {bullets.slice(0, 2).map((b, idx) => (
                            <span key={idx} className="bg-zinc-900 border border-white/10 px-2 py-1 rounded-md text-[9px] font-bold text-zinc-400 uppercase tracking-tighter whitespace-nowrap">
                              {b}
                            </span>
                          ))}
                        </div>
                        <div className="text-purple-500 group-hover:translate-x-2 transition-transform duration-300 font-black italic uppercase tracking-tighter text-sm">
                          Explore →
                        </div>
                      </div>
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
