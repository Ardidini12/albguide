import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch, authHeader } from '../services/api';
import { useAuth } from '../hooks/useAuth';

type AvailabilityRow = {
  id: string;
  package_id: string;
  available_date: string;
  capacity: number;
  remaining: number;
  is_open: boolean;
  created_at: string;
  updated_at: string;
};

export function AdminPackageAvailabilityPage() {
  const { token } = useAuth();
  const { id } = useParams();

  const [items, setItems] = useState<AvailabilityRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [date, setDate] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [remaining, setRemaining] = useState<number | ''>('');
  const [isOpen, setIsOpen] = useState(true);

  const load = async () => {
    if (!id) return;
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch(`/admin/packages/${encodeURIComponent(id)}/availability`, { headers: authHeader(token) });
      setItems(data.availability || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => String(a.available_date).localeCompare(String(b.available_date)));
  }, [items]);

  const onUpsert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError(null);

    try {
      await apiFetch(`/admin/packages/${encodeURIComponent(id)}/availability`, {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify({
          available_date: date,
          capacity: capacity === '' ? 0 : Number(capacity),
          remaining: remaining === '' ? undefined : Number(remaining),
          is_open: isOpen,
        }),
      });
      await load();
    } catch (e2) {
      setError((e2 as Error).message);
    }
  };

  const onDelete = async (availabilityId: string) => {
    if (!confirm('Delete this availability row?')) return;
    setError(null);

    try {
      await apiFetch(`/admin/availability/${encodeURIComponent(availabilityId)}`, {
        method: 'DELETE',
        headers: authHeader(token),
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
              <div className="mt-1 text-sm text-gray-600">Package ID: {id}</div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/admin/packages" className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50">
                Back
              </Link>
              <button onClick={load} className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50">
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
          )}

          <form onSubmit={onUpsert} className="mt-6 rounded-xl border p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Date *</label>
              <input value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" placeholder="YYYY-MM-DD" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Capacity *</label>
              <input value={capacity} onChange={(e) => setCapacity(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 w-full rounded-md border px-3 py-2" type="number" min={0} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Remaining</label>
              <input value={remaining} onChange={(e) => setRemaining(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 w-full rounded-md border px-3 py-2" type="number" min={0} />
            </div>
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={isOpen} onChange={(e) => setIsOpen(e.target.checked)} />
                Open
              </label>
              <button className="ml-auto px-3 py-2 rounded-md bg-red-700 text-white text-sm hover:bg-red-600" type="submit">
                Upsert
              </button>
            </div>
          </form>

          <div className="mt-6">
            {loading ? (
              <div className="text-gray-600">Loading…</div>
            ) : sorted.length === 0 ? (
              <div className="rounded-xl border bg-gray-50 p-8 text-center text-gray-600">No availability yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-b">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Capacity</th>
                      <th className="py-2 pr-4">Remaining</th>
                      <th className="py-2 pr-4">Open</th>
                      <th className="py-2 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((a) => (
                      <tr key={a.id} className="border-b">
                        <td className="py-3 pr-4 font-medium text-gray-900">{a.available_date}</td>
                        <td className="py-3 pr-4 text-gray-700">{a.capacity}</td>
                        <td className="py-3 pr-4 text-gray-700">{a.remaining}</td>
                        <td className="py-3 pr-4 text-gray-700">{a.is_open ? 'Yes' : 'No'}</td>
                        <td className="py-3 pr-4">
                          <button onClick={() => onDelete(a.id)} className="px-3 py-1.5 rounded-md bg-red-700 text-white hover:bg-red-600" type="button">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
