import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function AppLayout() {
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Fade and slide transition on route change
    gsap.fromTo(
      mainRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-red-600">
      <Header />
      <main ref={mainRef} className="flex-1 relative">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
