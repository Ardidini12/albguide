import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
};

export function DestinationsDetailsPage() {
  const { slug } = useParams();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaIndex, setMediaIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    apiFetch(`/destinations/slug/${encodeURIComponent(slug)}`)
      .then((data) => setDestination(data.destination || null))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [slug]);

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

  const goNext = () => {
    setMediaIndex((i) => (i + 1) % mediaUrls.length);
  };

  const goPrev = () => {
    setMediaIndex((i) => (i - 1 + mediaUrls.length) % mediaUrls.length);
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
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
          <Link to="/destinations" className="inline-block mt-6 text-sm text-red-700 hover:underline">
            Back to destinations
          </Link>
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="rounded-2xl border bg-white p-8 text-gray-700">Destination not found.</div>
          <Link to="/destinations" className="inline-block mt-6 text-sm text-red-700 hover:underline">
            Back to destinations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Link to="/destinations" className="text-sm text-red-700 hover:underline">
          ← Back to destinations
        </Link>

        <div className="mt-4 rounded-2xl overflow-hidden border bg-white">
          <div className="bg-gray-100">
            <div className="relative w-full aspect-video max-h-[70vh]">
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
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <img
                  src={currentUrl}
                  alt={destination.name}
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
                </>
              )}
            </div>

            {mediaUrls.length > 1 && (
              <div className="p-3 bg-white border-t">
                <div className="flex gap-2 overflow-x-auto">
                  {mediaUrls.map((u, idx) => {
                    const thumbIsVideo = /\.(mp4|webm|mov)(\?.*)?$/i.test(String(u));
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
          </div>

          <div className="p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-3xl font-semibold text-gray-900">{destination.name}</h1>
              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                {destination.region}
              </span>
            </div>

            <p className="mt-4 text-gray-700 leading-relaxed">{destination.description}</p>

            {destination.best_time && (
              <div className="mt-6 rounded-xl border bg-gray-50 p-4">
                <div className="text-sm text-gray-500">Best time to visit</div>
                <div className="mt-1 font-medium text-gray-900">{destination.best_time}</div>
              </div>
            )}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border p-4">
                <div className="font-medium text-gray-900">Highlights</div>
                {destination.highlights?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {destination.highlights.map((h, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                        {h}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-gray-600">No highlights set.</div>
                )}
              </div>

              <div className="rounded-xl border p-4">
                <div className="font-medium text-gray-900">Activities</div>
                {destination.activities?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {destination.activities.map((a, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                        {a}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-gray-600">No activities set.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
