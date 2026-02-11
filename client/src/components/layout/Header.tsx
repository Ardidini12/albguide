import { Link, NavLink, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useAuth } from '../../hooks/useAuth';
import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { apiFetch, authHeader } from '../../services/api';
import { profilePictureEvents } from '../../utils/profilePictureEvents';

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-4 py-2 rounded-full text-xs font-black uppercase italic tracking-widest transition-all duration-300 ${isActive
          ? 'text-white bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)]'
          : 'text-zinc-400 hover:text-white hover:bg-white/5'
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
      // Don't fetch if no user or no token
      if (!user) {
        setProfilePicture(null);
        return;
      }

      if (!token) {
        setProfilePicture(null);
        return;
      }

      try {
        const data = await apiFetch('/users/me', { headers: authHeader(token) });
        setProfilePicture(data.user?.profile_picture || null);
      } catch (e: any) {
        const msg = String(e?.message || '');
        if (msg.includes('404') || msg.includes('User not found') || msg.includes('Invalid session') || msg.includes('user no longer exists') || msg.includes('Missing Authorization')) {
          setProfilePicture(null);
          // If the session is invalid, clear it
          if (msg.includes('Invalid session') || msg.includes('user no longer exists') || msg.includes('Missing Authorization')) {
            logout();
          }
        } else {
          console.error('Failed to fetch profile picture:', e);
        }
      }
    };

    fetchProfilePicture();
  }, [user, token, logout]);

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

  const headerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    gsap.from(headerRef.current, {
      y: -100,
      opacity: 0,
      duration: 1.2,
      ease: 'power4.out',
    });
  }, []);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 shadow-2l">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
              <span className="text-white font-black italic tracking-tighter text-xl">A</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-black italic text-xl text-white tracking-tighter leading-none">DISCOVER ALBANIA</div>
              <div className="text-[9px] text-red-600 font-bold uppercase tracking-[0.3em] mt-1">Premium Experiences</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-2">
            <NavItem to="/" label="Home" />
            <NavItem to="/packages" label="Packages" />
            <NavItem to="/services" label="Services" />
            <NavItem to="/destinations" label="Destinations" />
            <NavItem to="/support" label="Support" />
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-sm font-black text-white hover:border-red-600 transition-all overflow-hidden"
                >
                  {profilePicture ? (
                    <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user.email.slice(0, 1).toUpperCase()
                  )}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-64 bg-zinc-950 border border-white/10 rounded-2xl shadow-3xl py-2 z-50 backdrop-blur-3xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                      <p className="text-[10px] font-black uppercase text-red-600 tracking-widest leading-none mb-1">Authenticated As</p>
                      <p className="text-sm font-bold text-white truncate">{user.email}</p>
                    </div>

                    <div className="py-2">
                      {user.isAdmin ? (
                        <>
                          <Link to="/user/profile" onClick={() => setShowDropdown(false)} className="block px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">My Profile</Link>
                          <div className="h-px bg-white/5 my-2"></div>
                          <Link to="/admin" onClick={() => setShowDropdown(false)} className="block px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors uppercase tracking-widest text-red-500">Admin Panel</Link>
                          <Link to="/admin/destinations" onClick={() => setShowDropdown(false)} className="block px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">Manage Destinations</Link>
                          <Link to="/admin/packages" onClick={() => setShowDropdown(false)} className="block px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">Manage Packages</Link>
                          <Link to="/admin/bookings" onClick={() => setShowDropdown(false)} className="block px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">Manage Bookings</Link>
                          <Link to="/admin/reviews" onClick={() => setShowDropdown(false)} className="block px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">Manage Reviews</Link>
                          <Link to="/admin/users" onClick={() => setShowDropdown(false)} className="block px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">Manage Users</Link>
                        </>
                      ) : (
                        <>
                          <Link to="/user/profile" onClick={() => setShowDropdown(false)} className="block px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">My Profile</Link>
                          <Link to="/user/bookings" onClick={() => setShowDropdown(false)} className="block px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">My Bookings</Link>
                          <Link to="/user/favorites" onClick={() => setShowDropdown(false)} className="block px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">My Favorites</Link>
                          <Link to="/user/reviews" onClick={() => setShowDropdown(false)} className="block px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">My Reviews</Link>
                        </>
                      )}
                    </div>

                    <div className="border-t border-white/5 mt-2">
                      <button onClick={onLogout} className="block w-full text-left px-4 py-3 text-xs font-black uppercase italic text-red-600 hover:bg-red-600/10 transition-colors">Logout</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="px-5 py-2 rounded-full border border-white/10 text-xs font-black uppercase italic tracking-widest text-zinc-300 hover:text-white hover:bg-white/5 transition-all">
                  Login
                </Link>
                <Link to="/register" className="px-5 py-2 rounded-full bg-red-600 text-white text-xs font-black uppercase italic tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:scale-105 transition-all">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
