import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch, authHeader } from '../services/api';
import { useAuth } from '../hooks/useAuth';

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
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-red-700 mb-2">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
              <p className="mt-1 text-gray-600">View and manage all users</p>
            </div>
            <button
              onClick={load}
              className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          )}

          {loading && users.length === 0 ? (
            <div className="mt-6 text-center text-gray-600">Loading...</div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Created</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 pr-4 font-medium text-gray-900">{u.email}</td>
                      <td className="py-3 pr-4 text-gray-700">{u.name || '—'}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          u.is_admin 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {u.is_admin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-700">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 pr-4">
                        <button
                          onClick={() => onDelete(u.id)}
                          className="px-3 py-1.5 rounded-md bg-red-700 text-white text-xs hover:bg-red-600 disabled:opacity-50"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {users.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-500">
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
