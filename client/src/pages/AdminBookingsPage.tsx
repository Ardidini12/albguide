import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
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
  updated_at: string;
};

export function AdminBookingsPage() {
  const { token } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<BookingRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingRow | null>(null);

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch('/admin/bookings', { headers: authHeader(token) });
      setItems(data.bookings || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useLayoutEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.from('.kinetic-header', { y: -50, opacity: 0, duration: 1, ease: 'power4.out' });
      gsap.from('.bg-zinc-900', { y: 50, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  const updateStatus = async (id: string, status: string) => {
    setError(null);
    try {
      await apiFetch(`/admin/bookings/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: authHeader(token),
        body: JSON.stringify({ status }),
      });
      await load();
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking(prev => prev ? ({ ...prev, status }) : null);
      }
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const filteredItems = filterStatus === 'all'
    ? items
    : items.filter(b => b.status === filterStatus);

  const statusColors: Record<string, string> = {
    pending_contact: 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10',
    confirmed: 'text-green-500 border-green-500/30 bg-green-500/10',
    completed: 'text-blue-500 border-blue-500/30 bg-blue-500/10',
    cancelled: 'text-red-500 border-red-500/30 bg-red-500/10',
  };

  return (
    <div ref={containerRef} className="bg-black min-h-screen pt-24 pb-12 px-4 selection:bg-red-600 font-sans text-zinc-100">
      <div className="max-w-[90rem] mx-auto">
        <div className="kinetic-header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12 border-b border-white/10 pb-8">
          <div>
            <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-red-600 mb-4 transition-colors uppercase tracking-widest">
              ← Back to Dashboard
            </Link>
            <h1 className="text-5xl md:text-7xl font-black italic uppercase text-white tracking-tighter">
              Manage <span className="text-red-600">Bookings</span>
            </h1>
            <p className="mt-4 text-xl text-zinc-400 max-w-2xl border-l-4 border-red-600 pl-6">
              Oversee all package bookings.
            </p>
          </div>
          <button onClick={load} className="px-6 py-3 rounded-full border border-white/10 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-colors">
            Refresh
          </button>
        </div>

        {error && <div className="mb-8 rounded-xl border border-red-900/50 bg-red-950/30 px-6 py-4 text-sm font-bold text-red-200 animate-pulse">{error}</div>}

        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {['all', 'pending_contact', 'confirmed', 'completed', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${filterStatus === status
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/20 scale-105'
                    : 'bg-black border border-white/10 text-zinc-500 hover:text-white hover:border-white/30'
                  }`}
              >
                {status.replace('_', ' ')} ({status === 'all' ? items.length : items.filter(b => b.status === status).length})
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-2xl font-black text-zinc-700 uppercase animate-pulse">Loading Bookings...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-black/50 rounded-2xl border border-white/5">
              <p className="text-xl font-bold text-zinc-500 uppercase">No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-500 border-b border-white/10 font-black uppercase tracking-wider text-xs">
                    <th className="py-4 pr-4">ID</th>
                    <th className="py-4 pr-4">Date</th>
                    <th className="py-4 pr-4">Guest</th>
                    <th className="py-4 pr-4">Contact</th>
                    <th className="py-4 pr-4">Travelers</th>
                    <th className="py-4 pr-4">Status</th>
                    <th className="py-4 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredItems.map((b) => (
                    <tr key={b.id} className="hover:bg-white/5 transition-colors group">
                      <td className="py-4 pr-4 font-mono text-zinc-600 group-hover:text-zinc-400">{b.id.slice(0, 8)}...</td>
                      <td className="py-4 pr-4 font-bold text-white">{new Date(b.booking_date).toLocaleDateString()}</td>
                      <td className="py-4 pr-4 font-bold text-white">{b.guest_full_name}</td>
                      <td className="py-4 pr-4 text-green-500 font-mono tracking-tighter">
                        <a href={`https://wa.me/${b.whatsapp_number.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-green-400 flex items-center gap-1">
                          <span>✆</span> {b.whatsapp_number}
                        </a>
                      </td>
                      <td className="py-4 pr-4 text-zinc-400 font-bold">{b.traveler_count}</td>
                      <td className="py-4 pr-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${statusColors[b.status] || 'text-zinc-500 border-zinc-500/30'}`}>
                          {b.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        <button onClick={() => setSelectedBooking(b)} className="px-3 py-1.5 rounded-lg border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 hover:scale-105 transition-all">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedBooking && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 z-50 animate-in fade-in duration-300" onClick={() => setSelectedBooking(null)}>
            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedBooking(null)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div className="mb-8">
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Booking Details</div>
                <h2 className="text-3xl font-black italic uppercase text-white">{selectedBooking.guest_full_name}</h2>
                <div className={`mt-2 inline-block px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest border ${statusColors[selectedBooking.status]}`}>
                  {selectedBooking.status.replace('_', ' ')}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Date</div>
                  <div className="text-white font-bold">{new Date(selectedBooking.booking_date).toLocaleDateString()}</div>
                </div>
                <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Travelers</div>
                  <div className="text-white font-bold">{selectedBooking.traveler_count} (Ad: {selectedBooking.adults}, Ch: {selectedBooking.children}, In: {selectedBooking.infants})</div>
                </div>
                <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Contact</div>
                  <a href={`https://wa.me/${selectedBooking.whatsapp_number.replace(/\+/g, '')}`} target="_blank" className="text-green-500 font-mono font-bold hover:underline">{selectedBooking.whatsapp_number}</a>
                </div>
                <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Note</div>
                  <div className="text-white font-medium italic">{selectedBooking.note || 'None'}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-6 border-t border-white/10 justify-end">
                {selectedBooking.status !== 'confirmed' && <button onClick={() => updateStatus(selectedBooking.id, 'confirmed')} className="px-5 py-2 rounded-full bg-green-600 text-white font-bold uppercase text-xs hover:bg-green-700">Confirm</button>}
                {selectedBooking.status !== 'completed' && <button onClick={() => updateStatus(selectedBooking.id, 'completed')} className="px-5 py-2 rounded-full bg-blue-600 text-white font-bold uppercase text-xs hover:bg-blue-700">Complete</button>}
                {selectedBooking.status !== 'cancelled' && <button onClick={() => updateStatus(selectedBooking.id, 'cancelled')} className="px-5 py-2 rounded-full bg-red-600 text-white font-bold uppercase text-xs hover:bg-red-700">Cancel</button>}
                {selectedBooking.status !== 'pending_contact' && <button onClick={() => updateStatus(selectedBooking.id, 'pending_contact')} className="px-5 py-2 rounded-full border border-yellow-600/50 text-yellow-500 font-bold uppercase text-xs hover:bg-yellow-600/10">Set Pending</button>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
