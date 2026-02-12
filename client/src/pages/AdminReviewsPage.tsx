import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
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
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => { load(); }, []);

  useLayoutEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.from('.kinetic-header', { y: -50, opacity: 0, duration: 1, ease: 'power4.out' });
      gsap.from('.review-item', { y: 30, opacity: 0, duration: 0.5, stagger: 0.05, ease: 'back.out(1.2)', delay: 0.2 });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  const deleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    setError(null);
    try {
      await apiFetch(`/admin/reviews/${encodeURIComponent(id)}`, { method: 'DELETE', headers: authHeader(token) });
      await load();
    } catch (e) { setError((e as Error).message); }
  };



  return (
    <div ref={containerRef} className="bg-black min-h-screen pt-24 pb-12 px-4 selection:bg-red-600 font-sans text-zinc-100">
      <div className="max-w-6xl mx-auto">
        <div className="kinetic-header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12 border-b border-white/10 pb-8">
          <div>
            <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-red-600 mb-4 transition-colors uppercase tracking-widest">
              ← Back to Dashboard
            </Link>
            <h1 className="text-5xl md:text-7xl font-black italic uppercase text-white tracking-tighter">
              Manage <span className="text-red-600">Reviews</span>
            </h1>
            <p className="mt-4 text-xl text-zinc-400 max-w-2xl border-l-4 border-red-600 pl-6">
              Moderate traveler feedback.
            </p>
          </div>
          <button onClick={load} className="px-6 py-3 rounded-full border border-white/10 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-colors">
            Refresh
          </button>
        </div>

        {error && <div className="mb-8 rounded-xl border border-red-900/50 bg-red-950/30 px-6 py-4 text-sm font-bold text-red-200 animate-pulse">{error}</div>}

        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
          {loading ? (
            <div className="text-center py-20 text-2xl font-black text-zinc-700 uppercase animate-pulse">Loading Reviews...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-black/50 rounded-2xl border border-white/5">
              <p className="text-xl font-bold text-zinc-500 uppercase">No reviews yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {items.map((r) => (
                <div key={r.id} className="review-item bg-black/50 border border-white/5 rounded-2xl p-6 hover:border-red-600/30 transition-all duration-300">
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex text-yellow-500 text-sm">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i}>{i < r.rating ? '★' : <span className="text-zinc-700">★</span>}</span>
                          ))}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${r.moderation_status === 'approved' ? 'border-green-500/30 text-green-500 bg-green-500/10' :
                          r.moderation_status === 'rejected' ? 'border-red-500/30 text-red-500 bg-red-500/10' :
                            'border-yellow-500/30 text-yellow-500 bg-yellow-500/10'
                          }`}>{r.moderation_status}</span>
                      </div>
                      <h3 className="text-xl font-black text-white italic uppercase">{r.title || 'No Title'}</h3>
                      <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">
                        {r.user_name || r.user_email?.split('@')[0] || 'User'} • {new Date(r.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2 self-start">
                      <button onClick={() => deleteReview(r.id)} className="px-3 py-1.5 rounded-lg bg-red-900/30 border border-red-900/50 text-red-500 text-xs font-bold uppercase tracking-wider hover:bg-red-900/50 hover:text-red-400 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="text-zinc-300 text-sm leading-relaxed border-l-2 border-zinc-800 pl-4">
                    {r.body}
                  </p>

                  <div className="mt-4 flex gap-4 text-[10px] sm:text-xs text-zinc-600 font-mono">
                    <span>Pkg: {r.package_id.slice(0, 8)}...</span>
                    <span>Bkg: {r.booking_id.slice(0, 8)}...</span>
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
