import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useState, useRef, useEffect } from 'react';
import { apiFetch, authHeader } from '../../services/api';
import { profilePictureEvents } from '../../utils/profilePictureEvents';

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
  const { user, logout, token } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (!user || !token) {
        setProfilePicture(null);
        return;
      }

      try {
        const data = await apiFetch('/users/me', { headers: authHeader(token) });
        setProfilePicture(data.user?.profile_picture || null);
      } catch (e) {
        console.error('Failed to fetch profile picture:', e);
      }
    };

    fetchProfilePicture();
  }, [user, token]);

  useEffect(() => {
    // Listen for profile picture change events
    const unsubscribe = profilePictureEvents.subscribe((newProfilePicture) => {
      setProfilePicture(newProfilePicture);
    });

    return unsubscribe;
  }, []);

  const onLogout = () => {
    logout();
    navigate('/');
    setShowDropdown(false);
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
            <NavItem to="/services" label="Services" />
            <NavItem to="/destinations" label="Destinations" />
            <NavItem to="/support" label="Support" />

            {/* {user?.isAdmin && (
              <>
                <NavItem to="/admin/packages" label="Admin Packages" />
                <NavItem to="/admin/reviews" label="Admin Reviews" />
              </>
            )} */}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-9 h-9 rounded-full bg-gray-100 border flex items-center justify-center text-sm font-semibold text-gray-800 hover:bg-gray-200 transition-colors overflow-hidden"
                  >
                    {profilePicture ? (
                      <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user.email.slice(0, 1).toUpperCase()
                    )}
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg py-1 z-50">
                      {user.isAdmin ? (
                        <>
                          <Link
                            to="/user/profile"
                            onClick={() => setShowDropdown(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            My Profile
                          </Link>
                          <div className="border-t my-1"></div>
                          <Link
                            to="/admin"
                            onClick={() => setShowDropdown(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Admin Dashboard
                          </Link>
                          <Link
                            to="/admin/destinations"
                            onClick={() => setShowDropdown(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Manage Destinations
                          </Link>
                          <Link
                            to="/admin/packages"
                            onClick={() => setShowDropdown(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Manage Packages
                          </Link>
                          <Link
                            to="/admin/bookings"
                            onClick={() => setShowDropdown(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Manage Bookings
                          </Link>
                          <Link
                            to="/admin/reviews"
                            onClick={() => setShowDropdown(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Manage Reviews
                          </Link>
                          <Link
                            to="/admin/users"
                            onClick={() => setShowDropdown(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Manage Users
                          </Link>
                          <div className="border-t my-1"></div>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/user/profile"
                            onClick={() => setShowDropdown(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            My Profile
                          </Link>
                          <Link
                            to="/user/bookings"
                            onClick={() => setShowDropdown(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            My Bookings
                          </Link>
                          <Link
                            to="/user/favorites"
                            onClick={() => setShowDropdown(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            My Favorites
                          </Link>
                          <Link
                            to="/user/reviews"
                            onClick={() => setShowDropdown(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            My Reviews
                          </Link>
                          <div className="border-t my-1"></div>
                        </>
                      )}
                      <button
                        onClick={onLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
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
