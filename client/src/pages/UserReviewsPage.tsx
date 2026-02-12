import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { apiFetch, authHeader } from '../services/api';
import { useAuth } from '../hooks/useAuth';

type Review = {
  id: string;
  booking_id: string;
  package_id: string;
  rating: number;
  title: string | null;
  body: string;
  created_at: string;
  moderation_status: string;
  package_name?: string; // from join
  media_urls?: string[]; // if we support media
};

export function UserReviewsPage() {
  const { token } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Media Upload State
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const loadReviews = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch('/reviews/me', { headers: authHeader(token) });
      setReviews(data.reviews || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [token]);

  useLayoutEffect(() => {
    if (loading || reviews.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.from('.kinetic-header', {
        y: -50, opacity: 0, duration: 1, ease: 'power4.out'
      });
      gsap.from('.review-card', {
        y: 50, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'back.out(1.2)', delay: 0.2
      });
    }, containerRef);
    return () => ctx.revert();
  }, [loading, reviews]);

  const startEditing = (r: Review) => {
    setEditingId(r.id);
    setEditRating(r.rating);
    setEditTitle(r.title || '');
    setEditBody(r.body);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditRating(5);
    setEditTitle('');
    setEditBody('');
  };

  const saveEdit = async (id: string) => {
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch(`/reviews/${id}`, {
        method: 'PUT',
        headers: authHeader(token),
        body: JSON.stringify({
          rating: editRating,
          title: editTitle,
          body: editBody,
        }),
      });
      await loadReviews();
      cancelEditing();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    setError(null);
    try {
      await apiFetch(`/reviews/${id}`, {
        method: 'DELETE',
        headers: authHeader(token),
      });
      await loadReviews();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const onUploadMedia = async (reviewId: string, files: File[]) => {
    setUploadingMedia(true);
    setError(null);

    try {
      for (const file of files) {
        // 1. Sign
        const sign = await apiFetch('/reviews/upload/sign', {
          method: 'POST',
          headers: authHeader(token),
          body: JSON.stringify({
            contentType: file.type,
            reviewId,
          })
        });

        if (!sign.url || !sign.path) throw new Error('Failed to get signature');

        // 2. Upload to Supabase/S3
        await fetch(sign.url, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type }
        });

        // 3. Register media
        await apiFetch(`/reviews/${reviewId}/media`, {
          method: 'POST',
          headers: authHeader(token),
          body: JSON.stringify({ path: sign.path })
        });
      }
      await loadReviews();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploadingMedia(false);
    }
  };

  // For deleting media, assumes we have an endpoint or logic. 
  // Since the original file didn't fully implement media deletion UI, 
  // I will stick to the refactor of existing features primarily.

  return (
    <div ref={containerRef} className="bg-black min-h-screen pt-24 pb-12 px-4 selection:bg-red-600 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="kinetic-header mb-12 text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase text-white tracking-tighter mb-4">
            My <span className="text-red-600">Reviews</span>
          </h1>
          <p className="text-xl text-zinc-400 border-l-4 border-red-600 pl-6 max-w-2xl">
            See what you've shared about your journeys.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-900/50 bg-red-950/30 px-6 py-4 text-sm font-bold text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="text-2xl font-black text-zinc-700 uppercase animate-pulse">Loading Reviews...</div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-12 text-center">
            <h3 className="text-2xl font-black italic uppercase text-white mb-4">No reviews yet</h3>
            <p className="text-zinc-400 mb-8">You haven't left any reviews yet. Book a trip and share your experience!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="review-card group relative bg-zinc-900 border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-red-600/30 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
              >
                {editingId === r.id ? (
                  /* Edit Mode */
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEditRating(star)}
                            className={`text-2xl transition-transform hover:scale-110 ${star <= editRating ? 'text-yellow-500' : 'text-zinc-700'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Title</label>
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-white font-bold focus:border-red-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Review</label>
                      <textarea
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        rows={4}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-white font-medium focus:border-red-600 focus:outline-none transition-colors resize-none"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={cancelEditing}
                        className="px-4 py-2 rounded-full border border-white/10 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(r.id)}
                        disabled={submitting}
                        className="px-4 py-2 bg-red-600 text-white font-black uppercase italic tracking-widest text-xs rounded-full hover:bg-red-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        {submitting ? 'Saving' : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <>
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-1 text-yellow-500 text-lg">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i}>{i < r.rating ? '★' : <span className="text-zinc-800">★</span>}</span>
                          ))}
                        </div>
                        <div className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${r.moderation_status === 'approved' ? 'border-green-500/30 text-green-500 bg-green-500/10' :
                          r.moderation_status === 'rejected' ? 'border-red-500/30 text-red-500 bg-red-500/10' :
                            'border-yellow-500/30 text-yellow-500 bg-yellow-500/10'
                          }`}>
                          {r.moderation_status}
                        </div>
                      </div>

                      <h3 className="text-white font-black uppercase italic text-xl mb-2 line-clamp-1" title={r.title || ''}>
                        {r.title || 'No Title'}
                      </h3>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">
                        {r.package_name || 'Package'} • {new Date(r.created_at).toLocaleDateString()}
                      </p>

                      <p className="text-zinc-300 text-sm leading-relaxed mb-6 line-clamp-4">
                        {r.body}
                      </p>

                      {/* Media Display - Placeholder for when backend supports it fully in this view */}
                      {r.media_urls && r.media_urls.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                          {r.media_urls.map((url, i) => (
                            <img key={i} src={url} className="w-16 h-16 rounded-lg object-cover border border-white/10" />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                      {/* Hidden File Input */}
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        ref={(el) => { fileInputRefs.current[r.id] = el; }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            onUploadMedia(r.id, Array.from(e.target.files));
                          }
                        }}
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={() => fileInputRefs.current[r.id]?.click()}
                          className="p-2 text-zinc-400 hover:text-white transition-colors hover:scale-110 transform"
                          title="Upload Photos"
                          disabled={uploadingMedia}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </button>
                        <button
                          onClick={() => startEditing(r)}
                          className="p-2 text-zinc-400 hover:text-white transition-colors hover:scale-110 transform"
                          title="Edit Review"
                          disabled={uploadingMedia}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button
                          onClick={() => deleteReview(r.id)}
                          className="p-2 text-red-700 hover:text-red-500 transition-colors hover:scale-110 transform"
                          title="Delete Review"
                          disabled={uploadingMedia}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
