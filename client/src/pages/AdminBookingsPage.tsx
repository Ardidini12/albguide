import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

  const updateStatus = async (id: string, status: string) => {
    setError(null);

    try {
      await apiFetch(`/admin/bookings/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: authHeader(token),
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const filteredItems = filterStatus === 'all' 
    ? items 
    : items.filter(b => b.status === filterStatus);

  const statusColors: Record<string, string> = {
    pending_contact: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-red-700 mb-2">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
              <p className="mt-1 text-gray-600">Manage all package bookings.</p>
            </div>
            <button onClick={load} className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50">
              Refresh
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-2 rounded-md text-sm ${filterStatus === 'all' ? 'bg-red-700 text-white' : 'border hover:bg-gray-50'}`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending_contact')}
              className={`px-3 py-2 rounded-md text-sm ${filterStatus === 'pending_contact' ? 'bg-red-700 text-white' : 'border hover:bg-gray-50'}`}
            >
              Pending ({items.filter(b => b.status === 'pending_contact').length})
            </button>
            <button
              onClick={() => setFilterStatus('confirmed')}
              className={`px-3 py-2 rounded-md text-sm ${filterStatus === 'confirmed' ? 'bg-red-700 text-white' : 'border hover:bg-gray-50'}`}
            >
              Confirmed ({items.filter(b => b.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-2 rounded-md text-sm ${filterStatus === 'completed' ? 'bg-red-700 text-white' : 'border hover:bg-gray-50'}`}
            >
              Completed ({items.filter(b => b.status === 'completed').length})
            </button>
            <button
              onClick={() => setFilterStatus('cancelled')}
              className={`px-3 py-2 rounded-md text-sm ${filterStatus === 'cancelled' ? 'bg-red-700 text-white' : 'border hover:bg-gray-50'}`}
            >
              Cancelled ({items.filter(b => b.status === 'cancelled').length})
            </button>
          </div>

          {loading ? (
            <div className="mt-6 text-gray-600">Loading…</div>
          ) : filteredItems.length === 0 ? (
            <div className="mt-6 rounded-xl border bg-gray-50 p-8 text-center text-gray-600">
              {filterStatus === 'all' ? 'No bookings yet.' : `No ${filterStatus.replace('_', ' ')} bookings.`}
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-2 pr-4">Booking ID</th>
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Guest</th>
                    <th className="py-2 pr-4">Contact</th>
                    <th className="py-2 pr-4">Travelers</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((b) => (
                    <tr key={b.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 pr-4 text-xs text-gray-500 font-mono max-w-[100px] truncate" title={b.id}>
                        {b.id.slice(0, 8)}...
                      </td>
                      <td className="py-3 pr-4 font-medium text-gray-900">
                        {new Date(b.booking_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 pr-4 text-gray-700">
                        <div className="font-medium">{b.guest_full_name}</div>
                      </td>
                      <td className="py-3 pr-4 text-gray-700">
                        <a 
                          href={`https://wa.me/${b.whatsapp_number.replace(/\+/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-700 hover:underline"
                        >
                          {b.whatsapp_number}
                        </a>
                      </td>
                      <td className="py-3 pr-4 text-gray-700">
                        <div className="text-xs">
                          {b.adults > 0 && <div>Adults: {b.adults}</div>}
                          {b.children > 0 && <div>Children: {b.children}</div>}
                          {b.infants > 0 && <div>Infants: {b.infants}</div>}
                          <div className="font-medium mt-1">Total: {b.traveler_count}</div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${statusColors[b.status] || 'bg-gray-100 text-gray-800'}`}>
                          {b.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="px-2 py-1 rounded text-xs border hover:bg-gray-50 flex items-center justify-center gap-1"
                            type="button"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                          {b.status !== 'confirmed' && (
                            <button
                              onClick={() => updateStatus(b.id, 'confirmed')}
                              className="px-2 py-1 rounded text-xs bg-green-700 text-white hover:bg-green-600"
                              type="button"
                            >
                              Confirm
                            </button>
                          )}
                          {b.status !== 'completed' && (
                            <button
                              onClick={() => updateStatus(b.id, 'completed')}
                              className="px-2 py-1 rounded text-xs bg-blue-700 text-white hover:bg-blue-600"
                              type="button"
                            >
                              Complete
                            </button>
                          )}
                          {b.status !== 'cancelled' && (
                            <button
                              onClick={() => updateStatus(b.id, 'cancelled')}
                              className="px-2 py-1 rounded text-xs bg-red-700 text-white hover:bg-red-600"
                              type="button"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedBooking(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-500 hover:text-gray-700"
                  type="button"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Booking ID</div>
                  <div className="mt-1 text-sm text-gray-900 font-mono break-all">{selectedBooking.id}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500">Package ID</div>
                  <div className="mt-1 text-sm text-gray-900 font-mono break-all">{selectedBooking.package_id}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500">Booking Date</div>
                  <div className="mt-1 text-sm text-gray-900">{new Date(selectedBooking.booking_date).toLocaleDateString()}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500">Guest Name</div>
                  <div className="mt-1 text-sm text-gray-900">{selectedBooking.guest_full_name}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500">WhatsApp Number</div>
                  <div className="mt-1">
                    <a 
                      href={`https://wa.me/${selectedBooking.whatsapp_number.replace(/\+/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-700 hover:underline"
                    >
                      {selectedBooking.whatsapp_number}
                    </a>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500">Travelers</div>
                  <div className="mt-1 text-sm text-gray-900">
                    <div>Adults: {selectedBooking.adults}</div>
                    <div>Children: {selectedBooking.children}</div>
                    <div>Infants: {selectedBooking.infants}</div>
                    <div className="font-medium mt-1">Total: {selectedBooking.traveler_count}</div>
                  </div>
                </div>

                {selectedBooking.note && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Note</div>
                    <div className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedBooking.note}</div>
                  </div>
                )}

                {selectedBooking.user_id && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">User ID</div>
                    <div className="mt-1 text-sm text-gray-900 font-mono break-all">{selectedBooking.user_id}</div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium text-gray-500">Status</div>
                  <div className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[selectedBooking.status] || 'bg-gray-100 text-gray-800'}`}>
                      {selectedBooking.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500">Created At</div>
                  <div className="mt-1 text-sm text-gray-900">{new Date(selectedBooking.created_at).toLocaleString()}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500">Updated At</div>
                  <div className="mt-1 text-sm text-gray-900">{new Date(selectedBooking.updated_at).toLocaleString()}</div>
                </div>

                <div className="pt-4 flex flex-wrap gap-2">
                  {selectedBooking.status !== 'confirmed' && (
                    <button
                      onClick={() => {
                        updateStatus(selectedBooking.id, 'confirmed');
                        setSelectedBooking(null);
                      }}
                      className="px-4 py-2 rounded-md bg-green-700 text-white text-sm hover:bg-green-600"
                      type="button"
                    >
                      Confirm
                    </button>
                  )}
                  {selectedBooking.status !== 'completed' && (
                    <button
                      onClick={() => {
                        updateStatus(selectedBooking.id, 'completed');
                        setSelectedBooking(null);
                      }}
                      className="px-4 py-2 rounded-md bg-blue-700 text-white text-sm hover:bg-blue-600"
                      type="button"
                    >
                      Complete
                    </button>
                  )}
                  {selectedBooking.status !== 'cancelled' && (
                    <button
                      onClick={() => {
                        updateStatus(selectedBooking.id, 'cancelled');
                        setSelectedBooking(null);
                      }}
                      className="px-4 py-2 rounded-md bg-red-700 text-white text-sm hover:bg-red-600"
                      type="button"
                    >
                      Cancel
                    </button>
                  )}
                  {selectedBooking.status !== 'pending_contact' && (
                    <button
                      onClick={() => {
                        updateStatus(selectedBooking.id, 'pending_contact');
                        setSelectedBooking(null);
                      }}
                      className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50"
                      type="button"
                    >
                      Set to Pending
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
