import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../services/api';

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
    email: 'support@discoveralbania.com',
    phone: '+355',
    whatsapp: '+355',
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

export function SupportPage() {
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

  const email = content.support?.email || '';
  const phone = content.support?.phone || '';
  const whatsapp = content.support?.whatsapp || '';

  const phoneClean = useMemo(() => normalizePhone(phone), [phone]);
  const whatsappClean = useMemo(() => normalizePhone(whatsapp), [whatsapp]);

  const rules = Array.isArray(content.safety_rules) ? content.safety_rules.filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-serif">Support</h1>
          <p className="mt-2 text-white/90 max-w-2xl">Contact us quickly, get clear answers, and stay safe while traveling.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        {loading && <div className="text-gray-600">Loading…</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl border bg-white shadow-sm p-6">
            <div className="text-sm text-gray-500">Support Email</div>
            <div className="mt-1 text-lg font-semibold text-gray-900 break-words">
              {email ? (
                <a className="text-red-700 hover:underline" href={`mailto:${email}`}>
                  {email}
                </a>
              ) : (
                '—'
              )}
            </div>
            <p className="mt-3 text-sm text-gray-600">Best for itinerary questions, confirmations, and general help.</p>
          </div>

          <div className="rounded-2xl border bg-white shadow-sm p-6">
            <div className="text-sm text-gray-500">Support Phone</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">
              {phone ? (
                <a className="text-red-700 hover:underline" href={phoneClean ? `tel:${phoneClean}` : undefined}>
                  {phone}
                </a>
              ) : (
                '—'
              )}
            </div>
            <p className="mt-3 text-sm text-gray-600">Best for urgent changes and time-sensitive questions.</p>
          </div>

          <div className="rounded-2xl border bg-white shadow-sm p-6">
            <div className="text-sm text-gray-500">WhatsApp</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">
              {whatsapp ? (
                <a
                  className="text-red-700 hover:underline"
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
            <p className="mt-3 text-sm text-gray-600">Best for coordinating pickups and meeting points.</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b bg-gradient-to-br from-gray-50 to-white">
            <h2 className="text-xl font-semibold text-gray-900">Safety</h2>
            <p className="mt-1 text-sm text-gray-600">A few simple rules to protect you and your trip.</p>
          </div>
          <div className="p-6">
            <ul className="space-y-3 text-gray-700">
              {rules.map((r) => (
                <li key={r} className="flex items-start gap-3">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-red-700 flex-shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
              {rules.length === 0 && <li className="text-gray-600">No safety rules configured yet.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
