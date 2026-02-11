import { useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '../services/api';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type ServicesSupportContent = {
  support?: {
    email?: string;
    phone?: string;
    whatsapp?: string;
  };
  safety_rules?: string[];
};

const fallbackContent: ServicesSupportContent = {
  support: {
    email: '',
    phone: '',
    whatsapp: '',
  },
  safety_rules: [
    'Never share payment details or sensitive personal information over chat.',
    'Only use official contact channels shown on this page.',
    'For emergencies, contact local authorities first.',
    'Confirm pickup details (date/time/location) before the trip.',
  ],
};

function normalizePhone(raw: string | undefined) {
  return String(raw || '').replace(/\s+/g, '').trim();
}

function normalizeEmail(raw: string | undefined) {
  const s = String(raw || '').trim();
  const m = s.match(/<([^>]+)>/);
  const candidate = (m?.[1] || s).trim();
  const cleaned = candidate.replace(/^mailto:/i, '').replace(/\s+/g, '');
  return cleaned;
}

export function SupportPage() {
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

      gsap.from('.support-card', {
        opacity: 0,
        y: 60,
        stagger: 0.1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.support-grid',
          start: 'top 85%',
        }
      });

      gsap.from('.safety-section', {
        opacity: 0,
        scale: 0.95,
        duration: 1.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.safety-section',
          start: 'top 90%',
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  const email = content.support?.email || '';
  const phone = content.support?.phone || '';
  const whatsapp = content.support?.whatsapp || '';

  const emailClean = useMemo(() => normalizeEmail(email), [email]);
  const phoneClean = useMemo(() => normalizePhone(phone), [phone]);
  const whatsappClean = useMemo(() => normalizePhone(whatsapp), [whatsapp]);

  const rules = Array.isArray(content.safety_rules) ? content.safety_rules.filter(Boolean) : [];

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-950">
      <div ref={heroRef} className="bg-gradient-to-r from-red-700 to-red-900 text-white py-12 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">Support</h1>
          <p className="mt-2 text-white/90 max-w-2xl font-medium">Contact us quickly, get clear answers, and stay safe while traveling.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        {loading && <div className="text-gray-600">Loading…</div>}

        <div className="support-grid grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="support-card rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl p-6 hover:border-red-600/50 transition-colors">
            <div className="text-[10px] font-black tracking-widest text-red-600 uppercase">Support Email</div>
            <div className="mt-1 text-lg font-bold text-white break-words">
              {emailClean ? (
                <a
                  className="hover:text-red-500 transition-colors"
                  href={`mailto:${emailClean}`}
                >
                  {emailClean}
                </a>
              ) : (
                '—'
              )}
            </div>
            <p className="mt-3 text-sm text-gray-400">Best for itinerary questions, confirmations, and general help.</p>
          </div>

          <div className="support-card rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl p-6 hover:border-red-600/50 transition-colors">
            <div className="text-[10px] font-black tracking-widest text-red-600 uppercase">Support Phone</div>
            <div className="mt-1 text-lg font-bold text-white">
              {phone ? (
                <a className="hover:text-red-500 transition-colors" href={phoneClean ? `tel:${phoneClean}` : undefined}>
                  {phone}
                </a>
              ) : (
                '—'
              )}
            </div>
            <p className="mt-3 text-sm text-gray-400">Best for urgent changes and time-sensitive questions.</p>
          </div>

          <div className="support-card rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl p-6 hover:border-red-600/50 transition-colors">
            <div className="text-[10px] font-black tracking-widest text-red-600 uppercase">WhatsApp</div>
            <div className="mt-1 text-lg font-bold text-white">
              {whatsapp ? (
                <a
                  className="hover:text-red-500 transition-colors"
                  href={whatsappClean ? `https://wa.me/${whatsappClean.replace(/^\+/, '')}` : undefined}
                  target="_blank"
                  rel="noreferrer"
                >
                  {whatsapp}
                </a>
              ) : (
                '—'
              )}
            </div>
            <p className="mt-3 text-sm text-gray-400">Best for coordinating pickups and meeting points.</p>
          </div>
        </div>

        <div className="safety-section mt-8 rounded-2xl border border-red-600/30 bg-zinc-900 shadow-[0_0_30px_rgba(220,38,38,0.1)] overflow-hidden">
          <div className="px-6 py-5 border-b border-red-600/20 bg-gradient-to-br from-zinc-900 to-zinc-950">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Safety First</h2>
            <p className="mt-1 text-sm text-gray-400 font-medium tracking-wide">A few simple rules to protect you.</p>
          </div>
          <div className="p-6">
            <ul className="space-y-4 text-gray-300">
              {rules.map((r) => (
                <li key={r} className="flex items-start gap-4 group">
                  <span className="mt-2 w-2 h-2 rounded-full bg-red-600 flex-shrink-0 shadow-[0_0_10px_rgba(220,38,38,0.6)] group-hover:scale-125 transition-transform" />
                  <span className="font-medium">{r}</span>
                </li>
              ))}
              {rules.length === 0 && <li className="text-gray-500">No safety rules configured yet.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
