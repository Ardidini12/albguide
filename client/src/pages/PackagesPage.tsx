import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

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

  useLayoutEffect(() => {
    if (loading || items.length === 0) return;

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
      const cards = gsap.utils.toArray('.package-card');
      if (cards.length > 0) {
        gsap.from(cards, {
          opacity: 0,
          y: 60,
          scale: 0.95,
          stagger: 0.1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.package-grid',
            start: 'top 85%',
            toggleActions: 'play none none none',
          }
        });
      }

      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, [loading, items]);

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
        (p as Promise<void>).catch(() => { });
      }
    } catch {
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-zinc-100 selection:bg-red-600/30">
      {/* Hero Section */}
      <div ref={heroRef} className="relative py-24 md:py-32 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-black to-black z-0"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center md:text-left">
          <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none mb-6">
            EXPLORE <span className="text-red-600">PACKAGES</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl font-medium leading-relaxed border-l-4 border-red-600 pl-6 mx-auto md:mx-0">
            Curated journeys through Albania's most breathtaking landscapes and hidden gems.
          </p>
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
        ) : sorted.length === 0 ? (
          <div className="rounded-3xl border border-white/5 bg-zinc-900/30 p-12 text-center text-zinc-500 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-2">No packages available yet.</h3>
            <p>Our team is busy crafting new experiences for you.</p>
          </div>
        ) : (
          <div className="package-grid grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
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
                  className="package-card group bg-zinc-950 rounded-[2rem] overflow-hidden border border-white/10 hover:border-red-600/50 transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:-translate-y-2 flex flex-col"
                  onMouseEnter={() => {
                    setHoveredId(p.id);
                    if (activeUrl && isVideoUrl(activeUrl)) playPreview(p.id);
                  }}
                  onMouseLeave={() => {
                    setHoveredId((prev) => (prev === p.id ? null : prev));
                    pauseAndReset(videoRefs.current[p.id]);
                  }}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {activeUrl ? (
                      isVideoUrl(activeUrl) ? (
                        <video
                          key={activeUrl}
                          ref={(el) => {
                            videoRefs.current[p.id] = el;
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
                          alt={p.name}
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

                    {price && (
                      <div className="absolute top-4 right-4 bg-white text-black px-4 py-1.5 rounded-full font-black italic uppercase tracking-tighter text-lg shadow-xl">
                        {price}
                      </div>
                    )}

                    {media.length > 1 && (
                      <>
                        <button
                          type="button"
                          className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                          onClick={(e) => {
                            onControlClick(e);
                            setIndex(activeIndex - 1);
                          }}
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
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
                      {p.destination_name && (
                        <span className="text-red-500 font-black uppercase italic tracking-widest text-xs mb-2 block">
                          {p.destination_name}
                        </span>
                      )}
                      <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none">
                        {p.name}
                      </h2>
                    </div>

                    {p.about && (
                      <p className="text-zinc-400 text-sm font-medium leading-relaxed mb-6 line-clamp-3">
                        {p.about}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-6">
                      <div className="flex gap-2">
                        {p.duration && (
                          <span className="px-3 py-1 rounded-full bg-zinc-900 border border-white/10 text-xs font-bold uppercase tracking-widest text-white">
                            {p.duration}
                          </span>
                        )}
                        <span className="px-3 py-1 rounded-full bg-red-600/20 text-red-500 text-xs font-bold uppercase tracking-widest">
                          Premium
                        </span>
                      </div>
                      <div className="text-red-600 group-hover:translate-x-2 transition-transform duration-300 font-black italic uppercase tracking-tighter text-sm">
                        Details →
                      </div>
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
