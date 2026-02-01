export function HomePage() {
  return (
    <div className="bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="rounded-2xl bg-white border shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            This dashboard is accessible to users and non-users. Login to access your user dashboard, or use an admin account to manage users.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border bg-white p-4">
              <div className="text-sm text-gray-500">Status</div>
              <div className="mt-1 font-semibold text-gray-900">Active</div>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <div className="text-sm text-gray-500">Mode</div>
              <div className="mt-1 font-semibold text-gray-900">React + Node</div>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <div className="text-sm text-gray-500">Backend</div>
              <div className="mt-1 font-semibold text-gray-900">PostgreSQL (Supabase pooler)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
