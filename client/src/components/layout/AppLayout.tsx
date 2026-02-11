import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function AppLayout() {
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Kill any existing tweens to prevent overlapping animations
    if (mainRef.current) {
      gsap.killTweensOf(mainRef.current);

      // Set coordination flag for page-level animations
      mainRef.current.dataset.routeAnimating = 'true';

      // Fade and slide transition on route change
      const tween = gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          onComplete: () => {
            if (mainRef.current) {
              delete mainRef.current.dataset.routeAnimating;
            }
          }
        }
      );

      return () => {
        tween.kill();
        if (mainRef.current) {
          delete mainRef.current.dataset.routeAnimating;
        }
      };
    }
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
