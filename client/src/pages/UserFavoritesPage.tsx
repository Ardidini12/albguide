import { useEffect, useMemo, useState } from 'react';
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
  description: string | null;
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

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
              <p className="mt-1 text-gray-600">Saved packages.</p>
            </div>
            <button onClick={load} className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50">
              Refresh
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
          )}

          {loading ? (
            <div className="mt-6 text-gray-600">Loading…</div>
          ) : ordered.length === 0 ? (
            <div className="mt-6 rounded-xl border bg-gray-50 p-8 text-center text-gray-600">No favorites yet.</div>
          ) : (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {ordered.map((f) => {
                const p = packages[String(f.package_id)];
                const cover = p?.media_urls && p.media_urls[0] ? String(p.media_urls[0]) : '';

                return (
                  <Link
                    key={f.package_id}
                    to={p ? `/packages/${p.slug}` : '#'}
                    className="rounded-2xl overflow-hidden border bg-white hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-40 bg-gray-100 overflow-hidden">
                      {cover ? (
                        isVideoUrl(cover) ? (
                          <video src={cover} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                        ) : (
                          <img src={cover} alt={p?.name || ''} className="w-full h-full object-cover" loading="lazy" />
                        )
                      ) : (
                        <img src={'/placeholder.jpg'} alt={p?.name || ''} className="w-full h-full object-cover" loading="lazy" />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="font-semibold text-gray-900">{p?.name || `Package ${f.package_id}`}</div>
                      {p?.destination_name && (
                        <div className="mt-1 text-xs text-gray-500">
                          {p.destination_name}
                          {p.destination_region ? ` • ${p.destination_region}` : ''}
                        </div>
                      )}
                      {p?.description && <div className="mt-2 text-sm text-gray-600 line-clamp-2">{p.description}</div>}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
