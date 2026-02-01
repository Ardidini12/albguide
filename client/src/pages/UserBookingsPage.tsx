import { useEffect, useState } from 'react';
import { apiFetch, authHeader } from '../services/api';
import { useAuth } from '../hooks/useAuth';

type BookingRow = {
  id: string;
  package_id: string;
  user_id: string | null;
  booking_date: string;
  guest_full_name: string;
  whatsapp_number: string;
  adults: number;
  children: number;
  infants: number;
  traveler_count: number;
  note: string | null;
  status: string;
  created_at: string;
};

export function UserBookingsPage() {
  const { token } = useAuth();

  const [items, setItems] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reviewBookingId, setReviewBookingId] = useState<string>('');
  const [reviewPackageId, setReviewPackageId] = useState<string>('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch('/bookings/me', { headers: authHeader(token) });
      setItems(data.bookings || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const startReview = (b: BookingRow) => {
    setReviewMsg(null);
    setReviewBookingId(b.id);
    setReviewPackageId(b.package_id);
    setRating(5);
    setTitle('');
    setBody('');
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewMsg(null);
    setReviewLoading(true);

    try {
      await apiFetch('/reviews', {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify({
          booking_id: reviewBookingId,
          package_id: reviewPackageId,
          rating,
          title: title || undefined,
          body,
        }),
      });

      setReviewMsg('Review submitted (pending moderation).');
    } catch (e2) {
      setReviewMsg((e2 as Error).message);
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
              <p className="mt-1 text-gray-600">Your booking history.</p>
            </div>
            <button onClick={load} className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50">
              Refresh
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-6 text-gray-600">Loading…</div>
          ) : items.length === 0 ? (
            <div className="mt-6 rounded-xl border bg-gray-50 p-8 text-center text-gray-600">No bookings yet.</div>
          ) : (
            <div className="mt-6 space-y-3">
              {items.map((b) => (
                <div key={b.id} className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900">{b.booking_date}</div>
                      <div className="mt-1 text-xs text-gray-500">Booking ID: {b.id}</div>
                      <div className="mt-1 text-xs text-gray-500">Package ID: {b.package_id}</div>
                    </div>
                    <div className="text-sm">
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800">{b.status}</span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-700">
                    <div>
                      <div className="text-xs text-gray-500">Traveler</div>
                      <div className="font-medium">{b.guest_full_name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">WhatsApp</div>
                      <div className="font-medium">{b.whatsapp_number}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Travelers</div>
                      <div className="font-medium">{b.traveler_count}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-gray-500">Created: {new Date(b.created_at).toLocaleString()}</div>
                    <button
                      onClick={() => startReview(b)}
                      className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50"
                      type="button"
                      disabled={b.status !== 'completed'}
                      title={b.status !== 'completed' ? 'Available after completed' : ''}
                    >
                      Leave review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 rounded-2xl border p-6">
            <div className="text-lg font-semibold text-gray-900">Leave a review</div>
            <p className="mt-1 text-sm text-gray-600">Select a completed booking above to prefill.</p>

            {reviewMsg && (
              <div className="mt-4 rounded-lg border px-3 py-2 text-sm">{reviewMsg}</div>
            )}

            <form onSubmit={submitReview} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Booking ID</label>
                <input value={reviewBookingId} readOnly className="mt-1 w-full rounded-md border px-3 py-2 bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Package ID</label>
                <input value={reviewPackageId} readOnly className="mt-1 w-full rounded-md border px-3 py-2 bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rating</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Review *</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  rows={4}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <button
                  disabled={reviewLoading || !reviewBookingId}
                  className="w-full rounded-md bg-red-700 text-white py-2 text-sm font-medium hover:bg-red-600 disabled:opacity-50"
                  type="submit"
                >
                  {reviewLoading ? 'Submitting…' : 'Submit review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
