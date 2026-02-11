import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../services/api';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type ServicesSupportContent = {
  services?: Array<{
    id?: string;
    title?: string;
    subtitle?: string;
    description?: string;
    highlights?: string[];
  }>;
  support?: {
    email?: string;
    phone?: string;
    whatsapp?: string;
  };
  safety_rules?: string[];
};

const fallbackContent: ServicesSupportContent = {
  services: [
    {
      id: 'group_travel',
      title: 'Group Travel',
      subtitle: 'Families, friends, and small groups',
      description: 'Private and semi-private itineraries across Albania, built around your pace and interests.',
      highlights: ['Custom itinerary planning', 'Trusted local partners', 'Flexible stops & schedules'],
    },
    {
      id: 'business_travel',
      title: 'Business Travel',
      subtitle: 'Reliable, punctual, and professional',
      description: 'Airport-to-meeting transfers, day planning, and support for business visitors.',
      highlights: ['On-time pickups', 'Comfortable vehicles', 'Assistance with logistics'],
    },
    {
      id: 'airport_pickup',
      title: 'Airport Pickup',
      subtitle: 'Tirana International Airport (TIA) only',
      description: 'Direct pickup from Tirana Airport with clear instructions and a smooth handoff.',
      highlights: ['Meet & greet', 'Fixed pickup point', 'Easy WhatsApp coordination'],
    },
  ],
};

export function ServicesPage() {
  const [content, setContent] = useState<ServicesSupportContent>(fallbackContent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    apiFetch('/site-content/services-support')
      .then((data) => {
        const next = (data as any)?.content as ServicesSupportContent | undefined;
        if (mounted && next && typeof next === 'object') setContent(next);
      })
      .catch((e) => {
        if (mounted) setError((e as Error).message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.from(heroRef.current, {
        opacity: 0,
        y: -50,
        duration: 1.2,
        ease: 'power4.out',
      });

      gsap.from('.service-card', {
        opacity: 0,
        y: 60,
        stagger: 0.1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.services-grid',
          start: 'top 85%',
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  const services = Array.isArray(content.services) ? content.services : [];

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-950">
      <div ref={heroRef} className="bg-gradient-to-r from-red-700 to-red-900 text-white py-12 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">Services</h1>
          <p className="mt-2 text-white/90 max-w-2xl font-medium">
            Clear, reliable travel support in Albania—designed to be simple, comfortable, and safe.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        {loading && <div className="text-gray-600">Loading…</div>}

        <div className="services-grid grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((s, idx) => (
            <div
              key={s.id || s.title || idx}
              className="service-card rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl overflow-hidden hover:border-red-600/50 transition-colors"
            >
              <div className="p-6">
                <div className="w-10 h-10 rounded-xl bg-red-700/20 flex items-center justify-center">
                  <div className="w-4 h-4 rounded bg-red-700" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-white uppercase tracking-tight">{s.title || 'Service'}</h2>
                {s.subtitle && <p className="mt-1 text-sm text-gray-400 font-medium">{s.subtitle}</p>}
                {s.description && <p className="mt-4 text-gray-300 leading-relaxed">{s.description}</p>}

                {Array.isArray(s.highlights) && s.highlights.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-white/5">
                    <div className="text-[10px] font-black tracking-widest text-red-600 uppercase">Highlights</div>
                    <ul className="mt-2 space-y-2 text-sm text-gray-300">
                      {s.highlights.filter(Boolean).map((h) => (
                        <li key={h} className="flex items-start gap-2">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-700 flex-shrink-0 shadow-[0_0_8px_rgba(185,28,28,0.5)]" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}

          {services.length === 0 && !loading && (
            <div className="rounded-2xl border bg-white p-8 text-gray-600">No services configured yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
