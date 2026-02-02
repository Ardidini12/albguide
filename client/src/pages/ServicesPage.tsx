import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';

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

  const services = Array.isArray(content.services) ? content.services : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-serif">Services</h1>
          <p className="mt-2 text-white/90 max-w-2xl">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((s) => (
            <div
              key={s.id || s.title || Math.random()}
              className="rounded-2xl border bg-white shadow-sm overflow-hidden"
            >
              <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                <div className="w-10 h-10 rounded-xl bg-red-700/10 flex items-center justify-center">
                  <div className="w-4 h-4 rounded bg-red-700" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-900">{s.title || 'Service'}</h2>
                {s.subtitle && <p className="mt-1 text-sm text-gray-600">{s.subtitle}</p>}
                {s.description && <p className="mt-4 text-gray-700">{s.description}</p>}

                {Array.isArray(s.highlights) && s.highlights.length > 0 && (
                  <div className="mt-5">
                    <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Highlights</div>
                    <ul className="mt-2 space-y-2 text-sm text-gray-700">
                      {s.highlights.filter(Boolean).map((h) => (
                        <li key={h} className="flex items-start gap-2">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-700 flex-shrink-0" />
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
