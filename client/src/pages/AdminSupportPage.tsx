import { useEffect, useState } from 'react';
import { apiFetch, authHeader } from '../services/api';
import { useAuth } from '../hooks/useAuth';

type SupportData = {
  support: {
    email: string;
    phone: string;
    whatsapp: string;
  };
  safety_rules: string[];
};

export function AdminSupportPage() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [safetyRules, setSafetyRules] = useState<string[]>([]);

  const load = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const data = await apiFetch('/admin/site-content/support', { headers: authHeader(token) }) as SupportData;
      setEmail(data.support?.email || '');
      setPhone(data.support?.phone || '');
      setWhatsapp(data.support?.whatsapp || '');
      setSafetyRules(data.safety_rules || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    load();
  }, [token]);

  const onSave = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const payload = {
        support: { email, phone, whatsapp },
        safety_rules: safetyRules,
      };
      await apiFetch('/admin/site-content/support', {
        method: 'PUT',
        headers: authHeader(token),
        body: JSON.stringify(payload),
      });
      setSuccess('Support information saved successfully.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const addSafetyRule = () => {
    setSafetyRules([...safetyRules, '']);
  };

  const removeSafetyRule = (index: number) => {
    setSafetyRules(safetyRules.filter((_, i) => i !== index));
  };

  const updateSafetyRule = (index: number, value: string) => {
    const updated = [...safetyRules];
    updated[index] = value;
    setSafetyRules(updated);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="rounded-2xl border bg-white shadow-sm p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Support</h1>
              <p className="mt-1 text-gray-600">Edit support contact information and safety rules.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={load}
                className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50"
                disabled={loading || saving}
              >
                Refresh
              </button>
              <button
                onClick={onSave}
                className="px-3 py-2 rounded-md bg-red-700 text-white text-sm hover:bg-red-600 disabled:opacity-60"
                disabled={saving || loading}
              >
                Save
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
              {success}
            </div>
          )}

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="support-email" className="block text-sm font-medium text-gray-700">Support Email</label>
                <input
                  id="support-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="support@example.com"
                />
              </div>

              <div>
                <label htmlFor="support-phone" className="block text-sm font-medium text-gray-700">Support Phone</label>
                <input
                  id="support-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="+355 XX XXX XXXX"
                />
                <p className="mt-1 text-xs text-gray-500">Use international format (e.g., +355...)</p>
              </div>

              <div>
                <label htmlFor="support-whatsapp" className="block text-sm font-medium text-gray-700">WhatsApp</label>
                <input
                  id="support-whatsapp"
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="+355 XX XXX XXXX"
                />
                <p className="mt-1 text-xs text-gray-500">Use international format (e.g., +355...)</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Safety Rules</h2>
              <button
                onClick={addSafetyRule}
                className="px-3 py-1.5 rounded-md bg-gray-200 text-gray-700 text-sm hover:bg-gray-300"
              >
                + Add Rule
              </button>
            </div>

            <div className="space-y-3">
              {safetyRules.map((rule, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => updateSafetyRule(index, e.target.value)}
                    className="flex-1 rounded-md border px-3 py-2 text-sm"
                    placeholder="Enter safety rule"
                  />
                  <button
                    onClick={() => removeSafetyRule(index)}
                    className="px-3 py-2 rounded-md bg-red-100 text-red-700 text-sm hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {safetyRules.length === 0 && (
                <p className="text-sm text-gray-500">No safety rules yet. Click "+ Add Rule" to add one.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
