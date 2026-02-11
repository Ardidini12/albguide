import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
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
};

export function DestinationsDetailsPage() {
  const { slug } = useParams();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaIndex, setMediaIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    apiFetch(`/destinations/slug/${encodeURIComponent(slug)}`)
      .then((data) => setDestination(data.destination || null))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [slug]);

  useLayoutEffect(() => {
    if (loading || !destination) return;
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
  }, [loading, destination?.id]);

  useEffect(() => {
    setMediaIndex(0);
  }, [destination?.id]);

  const mediaUrls =
    (destination?.media_urls && destination.media_urls.filter(Boolean)) ||
    (destination?.image_url ? [destination.image_url] : []);

  const currentUrl = mediaUrls[mediaIndex] || destination?.image_url || '/placeholder.jpg';
  const isVideo = /\.(mp4|webm|mov)(\?.*)?$/i.test(String(currentUrl));

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

  const goNext = () => {
    setMediaIndex((i) => (i + 1) % mediaUrls.length);
  };

  const goPrev = () => {
    setMediaIndex((i) => (i - 1 + mediaUrls.length) % mediaUrls.length);
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-zinc-500 font-black uppercase italic tracking-widest animate-pulse">Loading Destination…</div>
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
            <Link to="/destinations" className="text-sm font-black uppercase italic tracking-widest text-zinc-400 hover:text-white transition-colors">
              ← Back to destinations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="bg-black min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center text-zinc-500 font-bold uppercase tracking-widest">
          Destination not found.
          <Link to="/destinations" className="block mt-6 text-red-600 hover:underline">Back to destinations</Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="bg-black min-h-screen text-zinc-100 selection:bg-purple-600/30">
      <div className="max-w-6xl mx-auto px-4 py-12 lg:py-20">
        <Link to="/destinations" className="reveal-item text-xs text-purple-600 hover:text-white font-black uppercase italic tracking-widest transition-all inline-flex items-center gap-2 mb-8 group">
          <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span> Return to destinations
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
                      src={currentUrl}
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
                      src={currentUrl}
                      alt={destination.name}
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
                        className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full w-12 h-12 bg-black/40 backdrop-blur-xl text-white flex items-center justify-center border border-white/10 hover:bg-purple-600 hover:border-purple-600 transition-all opacity-0 group-hover/media:opacity-100 focus:opacity-100"
                        aria-label="Previous media"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={goNext}
                        className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full w-12 h-12 bg-black/40 backdrop-blur-xl text-white flex items-center justify-center border border-white/10 hover:bg-purple-600 hover:border-purple-600 transition-all opacity-0 group-hover/media:opacity-100 focus:opacity-100"
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
                      const thumbIsVideo = /\.(mp4|webm|mov)(\?.*)?$/i.test(String(u));
                      return (
                        <button
                          key={`${u}-${idx}`}
                          type="button"
                          onClick={() => setMediaIndex(idx)}
                          className={
                            idx === mediaIndex
                              ? 'h-20 w-32 flex-shrink-0 rounded-2xl overflow-hidden border-2 border-purple-600 bg-black shadow-[0_0_20px_rgba(147,51,234,0.3)]'
                              : 'h-20 w-32 flex-shrink-0 rounded-2xl overflow-hidden border border-white/5 bg-zinc-800 opacity-40 hover:opacity-100 transition-all'
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

              <div className="p-10 lg:p-14">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="space-y-4">
                    <h1 className="text-4xl lg:text-6xl font-black italic uppercase tracking-tighter leading-none text-white">{destination.name}</h1>
                    <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-purple-600">
                      <span className="w-8 h-px bg-purple-600"></span>
                      {destination.region}
                    </div>
                  </div>
                </div>

                <div className="mt-12 group">
                  <h3 className="text-xs font-black uppercase italic tracking-widest text-zinc-500 mb-4 px-3 border-l-2 border-purple-600">The Destination</h3>
                  <p className="text-lg lg:text-xl text-zinc-300 leading-relaxed font-medium">{destination.description}</p>
                </div>

                {destination.best_time && (
                  <div className="mt-12 rounded-3xl border border-white/5 bg-white/5 p-8 group hover:bg-white/[0.08] transition-all">
                    <div className="text-[10px] font-black uppercase tracking-widest text-purple-600 mb-2 font-black italic">Best Time To Explore</div>
                    <div className="text-2xl font-black italic uppercase tracking-tighter text-white">{destination.best_time}</div>
                  </div>
                )}

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="rounded-3xl border border-white/5 bg-zinc-950/50 p-8">
                    <h3 className="text-xs font-black uppercase italic tracking-widest text-zinc-500 mb-6 px-3 border-l-2 border-purple-600">Highlights</h3>
                    {destination.highlights?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {destination.highlights.map((h, idx) => (
                          <span key={idx} className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-purple-600/10 border border-purple-600/20 text-purple-400">
                            {h}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-zinc-500 font-bold italic">No highlights set.</div>
                    )}
                  </div>

                  <div className="rounded-3xl border border-white/5 bg-zinc-950/50 p-8">
                    <h3 className="text-xs font-black uppercase italic tracking-widest text-zinc-500 mb-6 px-3 border-l-2 border-purple-600">Activities</h3>
                    {destination.activities?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {destination.activities.map((a, idx) => (
                          <span key={idx} className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400">
                            {a}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-zinc-500 font-bold italic">No activities set.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="reveal-item sticky top-32 space-y-6">
              <div className="rounded-[2.5rem] border border-white/5 bg-zinc-950 p-10 shadow-3xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-[80px] rounded-full -mr-16 -mt-16"></div>

                <div className="relative z-10">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-6 leading-none">Ready to Explore?</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed font-medium mb-8">Discover our curated packages for {destination.name} and let us handle every detail of your VIP journey.</p>

                  <Link
                    to={`/packages?destination=${destination.id}`}
                    className="w-full h-14 rounded-2xl bg-purple-600 text-white text-xs font-black uppercase italic tracking-[0.2em] shadow-[0_0_30px_rgba(147,51,234,0.3)] flex items-center justify-center border border-transparent hover:scale-[1.02] hover:bg-black hover:text-purple-500 hover:border-purple-600 transition-all duration-300"
                  >
                    View Packages
                  </Link>

                  <p className="mt-8 text-[9px] text-zinc-600 font-bold uppercase tracking-widest text-center leading-relaxed">
                    Expert guides • Private transfers • Luxury stays
                  </p>
                </div>
              </div>

              <div className="p-8 rounded-[2rem] border border-white/5 bg-gradient-to-br from-zinc-900 to-black">
                <h4 className="text-xs font-black uppercase italic tracking-widest text-white mb-4">Curated Just For You</h4>
                <p className="text-xs text-zinc-500 leading-relaxed font-bold">Every destination in our collection is handpicked for its unique story and premium potential.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
