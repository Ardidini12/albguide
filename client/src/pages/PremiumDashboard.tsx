import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ALBANIA_IMAGES = [
 {
  url: 'https://images.unsplash.com/photo-1733413182592-b0e7a489256d?q=80&w=1331&auto=format&fit=crop',
  title: 'THE ALPS',
  description: 'Breathtaking peaks and traditional stone houses in the heart of the Albanian Alps.',
 },
 {
  url: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&q=80&w=1600',
  title: 'KSAMIL',
  description: 'Crystal clear emerald waters and pristine white beaches along the Ionian Sea.',
 },
 {
  url: 'https://images.unsplash.com/photo-1705405999485-188af37e0462?q=80&w=1171&auto=format&fit=crop',
  title: 'BERAT',
  description: 'The city of a thousand windows, a UNESCO World Heritage site standing for centuries.',
 },
 {
  url: 'https://plus.unsplash.com/premium_photo-1692788666857-40339cadd652?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  title: 'GJIROKASTER',
  description: 'The stone city, home to one of the Balkans most impressive citadels.',
 },
 {
  url: 'https://images.unsplash.com/photo-1665758362878-beff3f919a2b?q=80&w=1331&auto=format&fit=crop',
  title: 'SARANDE',
  description: 'The capital of the Riviera, where modern life meets ancient ruins.',
 },
 {
  url: 'https://images.unsplash.com/photo-1642886387324-9f733b0d81c1?q=80&w=735&auto=format&fit=crop',
  title: 'BLUE EYE',
  description: 'A magical natural spring of deep blue water that seems bottomless.',
 },
 {
  url: 'https://images.unsplash.com/photo-1742500481926-f61a4be9abfe?q=80&w=1082&auto=format&fit=crop',
  title: 'TIRANA',
  description: 'The colorful heart of Albania, a city that never sleeps.',
 },
 {
  url: 'https://usercontent.one/wp/stage.greenor.no/wp-content/uploads/2024/02/sk89o3vu0ainzxhbq2cgpdjw61y4fe5m-1920x1440.jpeg?media=1712405487',
  title: 'TRAIL OF COLORS',
  description: 'A stunning fusion of alpine splendor and authentic highland culture in scenic Kukës.',
 },
 {
  url: 'https://images.unsplash.com/photo-1724160705736-cfe2d1de6051?q=80&w=1332&auto=format&fit=crop',
  title: 'HIMARE',
  description: 'Authentic coastal charm with some of the best olive oil in the Mediterranean.',
 },
 {
  url: 'https://images.unsplash.com/photo-1717607423448-3e78d37cb489?q=80&w=687&auto=format&fit=crop',
  title: 'KRUJE',
  description: 'The historic capital of Skanderbeg, guarding the mountains above Tirana.',
 }
];

export function PremiumDashboard() {
 const containerRef = useRef<HTMLDivElement>(null);
 const heroRef = useRef<HTMLDivElement>(null);

 useLayoutEffect(() => {
  const ctx = gsap.context(() => {
   // Kinetic Typography - Slam Entrance
   gsap.from('.kinetic-title', {
    x: -100,
    opacity: 0,
    skewX: -20,
    duration: 1.5,
    ease: 'power4.out',
    stagger: 0.2,
   });

   gsap.from('.kinetic-subtitle', {
    y: 30,
    opacity: 0,
    duration: 1.2,
    delay: 0.5,
    ease: 'power3.out',
   });

   // Subtle drift/hover effect for text
   gsap.to('.hero-content', {
    y: -10,
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
   });

   // Parallax with depth
   gsap.to('.hero-bg', {
    yPercent: 20,
    ease: 'none',
    scrollTrigger: {
     trigger: heroRef.current,
     start: 'top top',
     end: 'bottom top',
     scrub: true,
    },
   });

   // Grain animation
   gsap.to('.grain-overlay', {
    x: 'random(-5, 5)%',
    y: 'random(-5, 5)%',
    duration: 0.1,
    repeat: -1,
    ease: 'none',
   });

   // Gallery Item Reveal
   gsap.utils.toArray<HTMLElement>('.gallery-item').forEach((item) => {
    gsap.from(item, {
     opacity: 0,
     y: 100,
     scale: 0.9,
     rotateX: 10,
     duration: 1.2,
     ease: 'power4.out',
     scrollTrigger: {
      trigger: item,
      start: 'top 90%',
      end: 'top 60%',
      scrub: 1,
     }
    });
   });

   // Button slam
   gsap.fromTo('.cta-btn',
    { scale: 0.8, opacity: 0 },
    {
     scale: 1,
     opacity: 1,
     duration: 1,
     delay: 1,
     stagger: 0.2,
     ease: 'elastic.out(1, 0.5)',
    }
   );
  }, containerRef);

  return () => ctx.revert();
 }, []);

 return (
  <div ref={containerRef} className="bg-black text-white min-h-screen font-sans overflow-x-hidden selection:bg-red-600">
   {/* Film Grain & Vignette Overlays */}
   <div className="fixed inset-0 pointer-events-none z-[99] opacity-[0.03] grain-overlay bg-[url('https://www.transparenttextures.com/patterns/p6.png')]"></div>
   <div className="fixed inset-0 pointer-events-none z-[98] bg-vignette"></div>

   {/* Hero Section */}
   <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
    <div className="hero-bg absolute inset-0 z-0 scale-110">
     <img
      src={ALBANIA_IMAGES[0].url}
      alt="Hero"
      className="w-full h-full object-cover brightness-[0.4] saturate-[1.2] contrast-[1.1]"
     />
     <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30"></div>
    </div>

    <div className="hero-content relative z-10 text-center px-4 max-w-5xl">
     <div className="overflow-hidden mb-2">
      <h1 className="kinetic-title text-4xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.8] drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
       DISCOVER<span className="text-red-600 italic">ALBANIA</span>
      </h1>
     </div>
     <p className="kinetic-subtitle text-xl md:text-2xl text-gray-400 mb-12 font-medium max-w-2xl mx-auto leading-relaxed border-l-4 border-red-600 pl-6 text-left drop-shadow-md">
      The next generation of travel. Albania’s most iconic destinations,
      redefined for the ultimate explorer.
     </p>

     <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
      <Link
       to="/packages"
       className="cta-btn group relative px-12 py-5 bg-red-700 text-white overflow-hidden font-black uppercase italic tracking-widest text-xl transition-all hover:bg-red-600 hover:scale-110 active:scale-95 shadow-[0_20px_50px_rgba(185,28,28,0.3)]"
      >
       <span className="relative z-10">Explore Packages</span>
       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine"></div>
      </Link>
      <Link
       to="/destinations"
       className="cta-btn group px-12 py-5 border-4 border-white/80 text-white hover:border-white hover:bg-white hover:text-black font-black uppercase italic tracking-widest text-xl transition-all hover:scale-110 active:scale-95 shadow-2xl"
      >
       View Destinations
      </Link>
     </div>
    </div>

    {/* Cinematic Scanlines */}
    <div className="absolute inset-0 pointer-events-none z-20 bg-scanlines opacity-[0.05]"></div>
   </section>

   {/* Cinematic Expanded Gallery */}
   <section className="py-24 px-6 max-w-[1600px] mx-auto overflow-hidden">
    <div className="mb-20 text-center">
     <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-none mb-4">
      THE <span className="text-red-600">COLLECTION</span>
     </h2>
     <div className="h-1 w-32 bg-red-600 mx-auto"></div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
     {ALBANIA_IMAGES.slice(1).map((image, idx) => (
      <div key={idx} className="gallery-item group relative overflow-hidden bg-zinc-900 border-2 border-white/10 hover:border-red-600/50 transition-colors duration-500">
       <div className="aspect-[3/4] overflow-hidden">
        <img
         src={image.url}
         alt={image.title}
         onError={(e) => {
          e.currentTarget.src = 'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&q=80&w=1600';
         }}
         className="w-full h-full object-cover saturate-[1.1] brightness-[0.7] group-hover:scale-110 group-hover:rotate-1 transition-transform duration-1000 ease-out"
        />
       </div>
       <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90"></div>
       <div className="absolute bottom-0 left-0 p-6 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
        <h3 className="text-3xl font-black italic uppercase leading-none mb-2 text-white">{image.title}</h3>
        <p className="text-sm font-medium text-zinc-300 opacity-60 group-hover:opacity-100 transition-opacity duration-500 delay-100 line-clamp-2">
         {image.description}
        </p>
       </div>
      </div>
     ))}
    </div>
   </section>

   {/* Footer Branding */}
   <footer className="py-24 text-center border-t border-white/10">
    <div className="inline-block bg-white text-black px-8 py-3 font-black uppercase italic tracking-tighter text-4xl md:text-6xl mb-6">
     DISCOVER ALBANIA
    </div>
    <p className="text-gray-600 font-bold uppercase tracking-[0.5em] text-xs">
     © 2026 DISCOVER ALBANIA. ALL RIGHTS RESERVED.
    </p>
   </footer>

   <style>{`
    .bg-vignette {
     background: radial-gradient(circle, transparent 20%, black 150%);
    }
    .bg-scanlines {
     background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5) 50%);
     background-size: 100% 4px;
    }
    @keyframes shine {
     100% { transform: translateX(100%); }
    }
    .animate-shine {
     animation: shine 1.5s infinite;
    }
    .line-clamp-2 {
     display: -webkit-box;
     -webkit-line-clamp: 2;
     -webkit-box-orient: vertical;
     overflow: hidden;
    }
   `}</style>
  </div>
 );
}
