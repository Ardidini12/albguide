import { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch, authHeader } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { gsap } from 'gsap';

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  is_admin: boolean;
  created_at: string;
};

export function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch('/users', { headers: authHeader(token) });
      setUsers(data.users || []);
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
    if (loading || users.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo('.user-row',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [loading, users]);

  const onDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    setError(null);
    try {
      await apiFetch(`/users/${id}`, { method: 'DELETE', headers: authHeader(token) });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div ref={containerRef} className="bg-black min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <Link to="/admin" className="text-zinc-500 hover:text-red-500 font-bold uppercase text-xs tracking-widest mb-2 inline-block transition-colors">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase text-white tracking-tighter">
              Manage <span className="text-red-600">Users</span>
            </h1>
          </div>
          <button
            onClick={load}
            className="px-6 py-2 rounded-full border border-white/20 text-white font-bold uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all"
          >
            Refresh List
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-200 text-sm font-bold">
            {error}
          </div>
        )}

        <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {loading && users.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 font-bold uppercase tracking-wider animate-pulse">Loading Users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black text-zinc-500 uppercase text-xs font-black tracking-wider border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4">User Info</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u) => (
                    <tr key={u.id} className="user-row hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white text-lg">{u.name || <span className="text-zinc-600 italic">No Name</span>}</div>
                        <div className="text-zinc-400 text-sm font-mono">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${u.is_admin
                            ? 'bg-red-900/30 text-red-500 border border-red-900/50 shadow-[0_0_10px_rgba(220,38,38,0.2)]'
                            : 'bg-zinc-800 text-zinc-400 border border-white/5'
                          }`}>
                          {u.is_admin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 font-mono text-sm">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onDelete(u.id)}
                          disabled={loading}
                          className="px-4 py-2 bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-red-700 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {users.length === 0 && !loading && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-zinc-500 font-bold uppercase">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
