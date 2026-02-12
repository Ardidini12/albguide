import { useEffect, useMemo, useState, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import { apiFetch, authHeader } from '../services/api';
import { useAuth } from '../hooks/useAuth';

type FavoriteRow = {
  package_id: string;
  created_at: string;
};

type PackageRow = {
  id: string;
  name: string;
  slug: string;
  about: string | null;
  media_urls?: string[];
  destination_name?: string;
  destination_region?: string;
};

function isVideoUrl(url: string) {
  const clean = url.split('?')[0]?.toLowerCase() ?? '';
  return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.mov') || clean.endsWith('.m4v');
}

export function UserFavoritesPage() {
  const { token } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const [packages, setPackages] = useState<Record<string, PackageRow | null>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    setLoading(true);

    try {
      const data = await apiFetch('/favorites', { headers: authHeader(token) });
      const favs = (data.favorites || []) as FavoriteRow[];
      setFavorites(favs);

      const uniqueIds = Array.from(new Set(favs.map((f) => String(f.package_id))));
      const results = await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            const p = await apiFetch(`/packages/${encodeURIComponent(id)}`);
            return [id, p.package as PackageRow] as const;
          } catch {
            return [id, null] as const;
          }
        })
      );

      const map: Record<string, PackageRow | null> = {};
      for (const [id, p] of results) map[id] = p;
      setPackages(map);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const ordered = useMemo(() => {
    return [...favorites].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  }, [favorites]);

  useLayoutEffect(() => {
    if (loading || ordered.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo('.favorite-card',
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [loading, ordered]);

  return (
    <div ref={containerRef} className="bg-black min-h-screen pt-24 pb-12 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-end mb-16 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-5xl md:text-7xl font-black italic uppercase text-white tracking-tighter loading-none">
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">Favorites</span>
            </h1>
            <p className="mt-4 text-zinc-400 max-w-xl text-lg border-l-2 border-red-600 pl-4">
              Your curated collection of premium Albanian experiences.
            </p>
          </div>

          <button
            onClick={load}
            className="hidden md:block px-8 py-3 rounded-full border border-white/20 text-white font-bold uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all hover:scale-105"
          >
            Refresh Collection
          </button>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-red-950/30 border border-red-900/50 rounded-2xl text-red-200 font-bold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-white text-2xl font-black uppercase tracking-widest animate-pulse">Loading Collection...</div>
          </div>
        ) : ordered.length === 0 ? (
          <div className="text-center py-32 border border-white/5 rounded-3xl bg-zinc-900/30">
            <h2 className="text-3xl font-black text-zinc-700 uppercase italic mb-4">No Favorites Yet</h2>
            <p className="text-zinc-500 mb-8 max-w-md mx-auto">Start exploring our premium packages and save your dream destinations here.</p>
            <Link to="/packages" className="px-8 py-4 bg-red-600 text-white font-black uppercase italic tracking-widest rounded-full hover:bg-red-700 transition-all hover:shadow-[0_0_30px_rgba(220,38,38,0.4)]">
              Explore Packages
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ordered.map((f) => {
              const p = packages[String(f.package_id)];
              const cover = p?.media_urls && p.media_urls[0] ? String(p.media_urls[0]) : '';

              return (
                <Link
                  key={f.package_id}
                  to={p ? `/packages/${p.slug}` : '#'}
                  className="favorite-card group block relative bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 hover:border-red-600/50 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {cover ? (
                      isVideoUrl(cover) ? (
                        <video src={cover} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-out" muted playsInline preload="metadata" />
                      ) : (
                        <img src={cover} alt={p?.name || ''} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-out" loading="lazy" />
                      )
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                        <span className="text-zinc-600 font-black text-4xl">?</span>
                      </div>
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>

                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">
                        {p?.destination_name || 'ALBANIA'}
                      </span>
                    </div>
                  </div>

                  <div className="p-8 relative z-10 -mt-12">
                    <div className="bg-black/80 backdrop-blur-xl p-6 rounded-2xl border border-white/10 group-hover:border-red-600/30 transition-colors">
                      <h3 className="text-xl font-black italic uppercase text-white mb-2 leading-none group-hover:text-red-500 transition-colors">
                        {p?.name || `Package #${f.package_id.substring(0, 8)}`}
                      </h3>
                      {p?.about && (
                        <p className="text-zinc-400 text-sm line-clamp-2 font-medium">
                          {p.about}
                        </p>
                      )}

                      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                          Added {new Date(f.created_at).toLocaleDateString()}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
                          ➜
                        </div>
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
