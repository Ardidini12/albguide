import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

export function AdminDashboard() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Title Animation
      gsap.from('.kinetic-title', {
        y: 50,
        opacity: 0,
        skewX: -20,
        duration: 1,
        ease: 'power4.out',
      });

      gsap.from('.kinetic-subtitle', {
        x: -20,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: 'power2.out',
      });

      // Card Stagger
      gsap.from('.admin-card', {
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.4,
      });

      // Hover effects handled by CSS/Tailwind group-hover, but we can add subtle continuous motion
      gsap.to('.grain-overlay', {
        x: 'random(-5, 5)%',
        y: 'random(-5, 5)%',
        duration: 0.1,
        repeat: -1,
        ease: 'none',
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const menuItems = [
    { to: '/admin/destinations', icon: '🗺️', title: 'Destinations', desc: 'Manage travel destinations' },
    { to: '/admin/packages', icon: '📦', title: 'Packages', desc: 'Manage tour packages' },
    { to: '/admin/bookings', icon: '📅', title: 'Bookings', desc: 'View and manage bookings' },
    { to: '/admin/reviews', icon: '⭐', title: 'Reviews', desc: 'Manage customer reviews' },
    { to: '/admin/users', icon: '👥', title: 'Users', desc: 'Manage user accounts' },
    { to: '/admin/services', icon: '🛠️', title: 'Services', desc: 'Manage services content' },
    { to: '/admin/support', icon: '💬', title: 'Support', desc: 'Manage support content' },
    { to: '/admin/offers', icon: '🏷️', title: 'Offers', desc: 'Manage special offers' },
  ];

  return (
    <div ref={containerRef} className="bg-black min-h-screen text-white font-sans overflow-x-hidden selection:bg-red-600">
      {/* Film Grain & Vignette Overlays */}
      <div className="fixed inset-0 pointer-events-none z-[99] opacity-[0.03] grain-overlay bg-[url('https://www.transparenttextures.com/patterns/p6.png')]"></div>
      <div className="fixed inset-0 pointer-events-none z-[98] bg-radial-gradient"></div>

      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="mb-16">
          <h1 className="kinetic-title text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-4">
            Admin <span className="text-red-600">Dashboard</span>
          </h1>
          <p className="kinetic-subtitle text-xl text-zinc-400 border-l-4 border-red-600 pl-6 max-w-2xl">
            Manage your travel empire from a single command center.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="admin-card group relative overflow-hidden bg-zinc-900 border border-white/20 p-8 rounded-3xl hover:border-red-600/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(220,38,38,0.2)]"
            >
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity transform group-hover:scale-110 group-hover:rotate-12 duration-500">
                <span className="text-8xl">{item.icon}</span>
              </div>

              <div className="relative z-10">
                <div className="text-4xl mb-6 group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-300 ease-out inline-block">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tight text-white mb-2 group-hover:text-red-500 transition-colors">
                  {item.title}
                </h3>
                <p className="text-zinc-400 font-medium text-sm group-hover:text-white transition-colors">
                  {item.desc}
                </p>
              </div>

              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none"></div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .bg-radial-gradient {
          background: radial-gradient(circle at center, transparent 0%, black 120%);
        }
        @keyframes shine {
          100% { transform: translateX(100%); }
        }
        .animate-shine {
          animation: shine 0.7s;
        }
      `}</style>
    </div>
  );
}
