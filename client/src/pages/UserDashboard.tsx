import { useEffect, useState } from 'react';
import { apiFetch, authHeader } from '../services/api';
import { useAuth } from '../hooks/useAuth';

type MeResponse = {
  user: {
    id: string;
    email: string;
    name: string | null;
    is_admin: boolean;
    created_at: string;
  };
};

export function UserDashboard() {
  const { token, user } = useAuth();
  const [me, setMe] = useState<MeResponse['user'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setError(null);

    apiFetch('/users/me', { headers: authHeader(token) })
      .then((data: MeResponse) => {
        if (mounted) setMe(data.user);
      })
      .catch((e) => {
        if (mounted) setError((e as Error).message);
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <div className="bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
          <p className="mt-1 text-gray-600">Welcome{user?.email ? `, ${user.email}` : ''}.</p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          )}

          {me && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border p-4">
                <div className="text-sm text-gray-500">Email</div>
                <div className="mt-1 font-semibold text-gray-900">{me.email}</div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="text-sm text-gray-500">Name</div>
                <div className="mt-1 font-semibold text-gray-900">{me.name || '—'}</div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="text-sm text-gray-500">Role</div>
                <div className="mt-1 font-semibold text-gray-900">{me.is_admin ? 'Admin' : 'User'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
