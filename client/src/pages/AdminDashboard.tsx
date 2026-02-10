import { Link } from 'react-router-dom';

export function AdminDashboard() {

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-gray-600">Manage your travel platform</p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/admin/destinations"
              className="p-6 rounded-xl border hover:border-red-300 hover:shadow-md transition-all group"
            >
              <div className="text-3xl mb-3">🗺️</div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-700">Destinations</h3>
              <p className="mt-1 text-sm text-gray-600">Manage travel destinations</p>
            </Link>

            <Link
              to="/admin/packages"
              className="p-6 rounded-xl border hover:border-red-300 hover:shadow-md transition-all group"
            >
              <div className="text-3xl mb-3">📦</div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-700">Packages</h3>
              <p className="mt-1 text-sm text-gray-600">Manage tour packages</p>
            </Link>

            <Link
              to="/admin/bookings"
              className="p-6 rounded-xl border hover:border-red-300 hover:shadow-md transition-all group"
            >
              <div className="text-3xl mb-3">📅</div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-700">Bookings</h3>
              <p className="mt-1 text-sm text-gray-600">View and manage bookings</p>
            </Link>

            <Link
              to="/admin/reviews"
              className="p-6 rounded-xl border hover:border-red-300 hover:shadow-md transition-all group"
            >
              <div className="text-3xl mb-3">⭐</div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-700">Reviews</h3>
              <p className="mt-1 text-sm text-gray-600">Manage customer reviews</p>
            </Link>

            <Link
              to="/admin/users"
              className="p-6 rounded-xl border hover:border-red-300 hover:shadow-md transition-all group"
            >
              <div className="text-3xl mb-3">👥</div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-700">Users</h3>
              <p className="mt-1 text-sm text-gray-600">Manage user accounts</p>
            </Link>

            <Link
              to="/admin/services"
              className="p-6 rounded-xl border hover:border-red-300 hover:shadow-md transition-all group"
            >
              <div className="text-3xl mb-3">🛠️</div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-700">Services</h3>
              <p className="mt-1 text-sm text-gray-600">Manage services content</p>
            </Link>

            <Link
              to="/admin/support"
              className="p-6 rounded-xl border hover:border-red-300 hover:shadow-md transition-all group"
            >
              <div className="text-3xl mb-3">💬</div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-700">Support</h3>
              <p className="mt-1 text-sm text-gray-600">Manage support content</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
