import { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { apiFetch, authHeader } from '../services/api';
import { useAuth } from '../hooks/useAuth';

type Booking = {
  id: string;
  package_id: string;
  booking_date: string;
  traveler_count: number;
  total_price: string;
  currency: string;
  status: string;
  created_at: string;
  package_name?: string;
  destination_name?: string;
  image_url?: string;
  reviewed?: boolean;
};

export function UserBookingsPage() {
  const { token } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [reviewPackageId, setReviewPackageId] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const loadBookings = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch('/bookings/me', { headers: authHeader(token) });
      setBookings(data.bookings || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [token]);

  useLayoutEffect(() => {
    if (loading || bookings.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.from('.kinetic-header', {
        y: -50, opacity: 0, duration: 1, ease: 'power4.out'
      });
      gsap.from('.booking-card', {
        y: 100, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.2
      });
    }, containerRef);
    return () => ctx.revert();
  }, [loading, bookings]);

  const openReviewModal = (bookingId: string, packageId: string) => {
    setReviewBookingId(bookingId);
    setReviewPackageId(packageId);
    setReviewRating(5);
    setReviewTitle('');
    setReviewBody('');
    setReviewError(null);
    setReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setReviewBookingId(null);
    setReviewPackageId(null);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBookingId || !reviewPackageId) return;

    setSubmittingReview(true);
    setReviewError(null);

    try {
      await apiFetch('/reviews', {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify({
          booking_id: reviewBookingId,
          package_id: reviewPackageId,
          rating: reviewRating,
          title: reviewTitle,
          body: reviewBody,
        }),
      });
      // Mark as reviewed properly and reload
      await loadBookings();
      closeReviewModal();
    } catch (err) {
      setReviewError((err as Error).message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-400 border-green-400/30 bg-green-950/30';
      case 'pending': return 'text-yellow-400 border-yellow-400/30 bg-yellow-950/30';
      case 'cancelled': return 'text-red-400 border-red-400/30 bg-red-950/30';
      case 'completed': return 'text-blue-400 border-blue-400/30 bg-blue-950/30';
      default: return 'text-zinc-400 border-zinc-400/30 bg-zinc-900';
    }
  };

  return (
    <div ref={containerRef} className="bg-black min-h-screen pt-24 pb-12 px-4 selection:bg-red-600 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="kinetic-header mb-12 text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase text-white tracking-tighter mb-4">
            My <span className="text-red-600">Bookings</span>
          </h1>
          <p className="text-xl text-zinc-400 border-l-4 border-red-600 pl-6 max-w-2xl">
            Track your upcoming and past adventures.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-900/50 bg-red-950/30 px-6 py-4 text-sm font-bold text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="text-2xl font-black text-zinc-700 uppercase animate-pulse">Loading Bookings...</div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-12 text-center">
            <h3 className="text-2xl font-black italic uppercase text-white mb-4">No bookings yet</h3>
            <p className="text-zinc-400 mb-8">You haven't booked any trips yet. Start exploring!</p>
            <a href="/packages" className="inline-block px-8 py-4 bg-red-600 text-white font-black uppercase italic tracking-widest rounded-full hover:bg-red-700 transition-all hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(220,38,38,0.3)]">
              Find a Trip
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="booking-card group relative bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden hover:border-red-600/30 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image Section */}
                  <div className="w-full md:w-1/3 lg:w-1/4 h-48 md:h-auto relative overflow-hidden">
                    <img
                      src={b.image_url || '/placeholder.jpg'}
                      alt={b.package_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/50"></div>
                    <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${getStatusColor(b.status)}`}>
                      {b.status}
                    </span>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                        <div>
                          <h2 className="text-2xl font-black italic uppercase text-white mb-1 group-hover:text-red-500 transition-colors">
                            {b.package_name || 'Unknown Package'}
                          </h2>
                          <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider">
                            {b.destination_name} • ID: <span className="font-mono text-zinc-600">{b.id.slice(0, 8)}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-white">
                            {b.total_price} <span className="text-sm text-zinc-500 font-medium">{b.currency}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Date</div>
                          <div className="text-white font-bold">{new Date(b.booking_date).toLocaleDateString()}</div>
                        </div>
                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Travelers</div>
                          <div className="text-white font-bold">{b.traveler_count}</div>
                        </div>
                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Booked On</div>
                          <div className="text-white font-bold">{new Date(b.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                      {/* Actions based on status could go here, e.g. Cancel if pending */}
                      {/* Review Button */}
                      {!b.reviewed && b.status === 'completed' && (
                        <button
                          onClick={() => openReviewModal(b.id, b.package_id)}
                          className="px-6 py-2 bg-red-600 text-white font-black uppercase italic tracking-widest text-xs rounded-full hover:bg-red-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-900/20"
                        >
                          Write a Review
                        </button>
                      )}
                      {b.reviewed && (
                        <span className="px-6 py-2 border border-green-500/30 text-green-500 font-black uppercase italic tracking-widest text-xs rounded-full bg-green-500/10 cursor-default">
                          Reviewed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-lg p-8 shadow-2xl relative">
            <button
              onClick={closeReviewModal}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-3xl font-black italic uppercase text-white mb-2">Write Review</h3>
            <p className="text-zinc-400 text-sm mb-6">Share your experience with others.</p>

            {reviewError && (
              <div className="mb-4 rounded-lg bg-red-950/50 border border-red-900 px-4 py-2 text-sm text-red-200">
                {reviewError}
              </div>
            )}

            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`text-2xl transition-transform hover:scale-110 ${star <= reviewRating ? 'text-yellow-500' : 'text-zinc-700'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Title</label>
                <input
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-red-600 focus:outline-none transition-colors placeholder-zinc-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Review</label>
                <textarea
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  placeholder="Tell us more about your trip..."
                  rows={4}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:border-red-600 focus:outline-none transition-colors placeholder-zinc-700 resize-none"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="px-6 py-3 rounded-full border border-white/10 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-8 py-3 bg-red-600 text-white font-black uppercase italic tracking-widest text-xs rounded-full hover:bg-red-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/20"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
