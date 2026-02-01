import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive ? 'text-red-700' : 'text-gray-700 hover:text-red-700'
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const onLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <div>
              <div className="font-serif text-lg text-gray-900">Discover Albania</div>
              <div className="text-[11px] text-gray-600">Your Journey Begins Here</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavItem to="/" label="Home" />
            <NavItem to="/packages" label="Packages" />
            <NavItem to="/" label="Services" />
            <NavItem to="/destinations" label="Destinations" />
            <NavItem to="/" label="Support" />

            {user && !user.isAdmin && (
              <>
                <NavItem to="/user/bookings" label="My Bookings" />
                <NavItem to="/user/favorites" label="My Favorites" />
              </>
            )}

            {user?.isAdmin && (
              <>
                <NavItem to="/admin/packages" label="Admin Packages" />
                <NavItem to="/admin/reviews" label="Admin Reviews" />
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                {user.isAdmin ? (
                  <Link
                    to="/admin"
                    className="hidden sm:inline-flex px-3 py-2 rounded-md border text-sm hover:bg-gray-50"
                  >
                    Admin
                  </Link>
                ) : (
                  <Link
                    to="/user"
                    className="hidden sm:inline-flex px-3 py-2 rounded-md border text-sm hover:bg-gray-50"
                  >
                    Dashboard
                  </Link>
                )}

                <div className="w-9 h-9 rounded-full bg-gray-100 border flex items-center justify-center text-sm font-semibold text-gray-800">
                  {user.email.slice(0, 1).toUpperCase()}
                </div>

                <button
                  onClick={onLogout}
                  className="px-3 py-2 rounded-md bg-red-700 text-white text-sm hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50">
                  Login
                </Link>
                <Link to="/register" className="px-3 py-2 rounded-md bg-red-700 text-white text-sm hover:bg-red-600">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
