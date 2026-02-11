import { Link } from 'react-router-dom';
import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(footerRef.current, {
        opacity: 0,
        y: 50,
        duration: 1.5,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 95%',
        },
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="bg-black text-zinc-400 border-t border-white/5 py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center">
                <span className="text-red-600 font-black italic tracking-tighter text-xl">A</span>
              </div>
              <div>
                <div className="font-black italic text-xl text-white tracking-tighter">DISCOVER ALBANIA</div>
                <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.3em]">Premium Travel</div>
              </div>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Redefining luxury and exploration in the heart of the Balkans. Unforgettable journeys tailored for the modern explorer.
            </p>
          </div>

          <div>
            <h3 className="text-white font-black uppercase italic tracking-widest text-xs mb-6 px-3 border-l-2 border-red-600">Quick Links</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link className="hover:text-red-600 transition-colors" to="/packages">Vacation Packages</Link></li>
              <li><Link className="hover:text-red-600 transition-colors" to="/destinations">Destinations</Link></li>
              <li><Link className="hover:text-red-600 transition-colors" to="/services">Our Services</Link></li>
              <li><Link className="hover:text-red-600 transition-colors" to="/support">Help & Support</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-black uppercase italic tracking-widest text-xs mb-6 px-3 border-l-2 border-red-600">Experiences</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><span className="text-zinc-500">Alpine Tours</span></li>
              <li><span className="text-zinc-500">Riviera Escapes</span></li>
              <li><span className="text-zinc-500">Historical Cities</span></li>
              <li><span className="text-zinc-500">Private Guidance</span></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-black uppercase italic tracking-widest text-xs mb-6 px-3 border-l-2 border-red-600">Contact</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-center gap-2">
                <span className="text-red-600">📍</span> Tirana, Albania
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-600">✉️</span> info@albguide.com
              </li>
              <li>
                <Link className="inline-block mt-4 px-6 py-2 bg-white text-black font-black uppercase italic text-xs tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl" to="/support">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
          <p>&copy; 2026 DISCOVER ALBANIA. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6">
            <Link className="hover:text-white transition-colors" to="/privacy">Privacy</Link>
            <Link className="hover:text-white transition-colors" to="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
