import { useEffect, useState } from 'react';
import { apiFetch, authHeader } from '../services/api';
import { useAuth } from '../hooks/useAuth';

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
};

export function AdminReviewsPage() {
  const { token } = useAuth();

  const [items, setItems] = useState<ReviewRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setError(null);
    setLoading(true);

    try {
      const data = await apiFetch('/admin/reviews', { headers: authHeader(token) });
      setItems(data.reviews || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id: string, moderationStatus: string) => {
    setError(null);

    try {
      await apiFetch(`/admin/reviews/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: authHeader(token),
        body: JSON.stringify({ moderation_status: moderationStatus }),
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
              <p className="mt-1 text-gray-600">Moderate traveler reviews.</p>
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
          ) : items.length === 0 ? (
            <div className="mt-6 rounded-xl border bg-gray-50 p-8 text-center text-gray-600">No reviews yet.</div>
          ) : (
            <div className="mt-6 space-y-3">
              {items.map((r) => (
                <div key={r.id} className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900">{r.title || 'Review'}</div>
                      <div className="mt-1 text-xs text-gray-500">
                        {r.user_name || (r.user_email ? r.user_email.split('@')[0] : 'User')} • {new Date(r.created_at).toLocaleString()}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">Package: {r.package_id}</div>
                      <div className="mt-1 text-xs text-gray-500">Booking: {r.booking_id}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs">{r.moderation_status}</span>
                      <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">{r.rating}/5</span>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{r.body}</div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button onClick={() => setStatus(r.id, 'approved')} className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50" type="button">
                      Approve
                    </button>
                    <button onClick={() => setStatus(r.id, 'rejected')} className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50" type="button">
                      Reject
                    </button>
                    <button onClick={() => setStatus(r.id, 'pending')} className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50" type="button">
                      Pending
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
