import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/api';

type PackageRow = {
  id: string;
  destination_id: string;
  name: string;
  slug: string;
  description: string | null;
  duration_minutes: number | null;
  price_cents: number | null;
  currency: string;
  media_urls?: string[];
  is_active: boolean;
  created_at: string;
  destination_name?: string;
  destination_slug?: string;
  destination_region?: string;
};

function formatPrice(priceCents: number | null, currency: string) {
  if (!priceCents || priceCents <= 0) return null;
  const value = (priceCents / 100).toFixed(0);
  return `${value} ${currency || 'EUR'}`;
}

function isVideoUrl(url: string) {
  const clean = url.split('?')[0]?.toLowerCase() ?? '';
  return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.mov') || clean.endsWith('.m4v');
}

export function PackagesPage() {
  const [items, setItems] = useState<PackageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-serif">Packages</h1>
          <p className="mt-2 text-white/90 max-w-2xl">Choose a tour, check availability, and book in minutes.</p>
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
              const cover = media[0] || '';
              const price = formatPrice(p.price_cents ?? null, p.currency);
              return (
                <Link
                  key={p.id}
                  to={`/packages/${p.slug}`}
                  className="group rounded-2xl overflow-hidden border bg-white hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-56 bg-gray-100 overflow-hidden">
                    {cover ? (
                      isVideoUrl(cover) ? (
                        <video
                          src={cover}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <img
                          src={cover}
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

                    {p.description && <p className="mt-2 text-gray-600 line-clamp-3">{p.description}</p>}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {p.duration_minutes ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                          {Math.round(p.duration_minutes / 60)}h
                        </span>
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
