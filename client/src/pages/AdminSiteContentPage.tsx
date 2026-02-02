import { useEffect, useMemo, useState } from 'react';
import { apiFetch, authHeader } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export function AdminSiteContentPage() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [rawJson, setRawJson] = useState('');

  const parsed = useMemo(() => {
    if (!rawJson.trim()) return null;
    try {
      return JSON.parse(rawJson);
    } catch {
      return null;
    }
  }, [rawJson]);

  const load = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const data = await apiFetch('/admin/site-content/services-support', { headers: authHeader(token) });
      const content = (data as any)?.content;
      setRawJson(JSON.stringify(content ?? {}, null, 2));
    } catch (e) {
      setError((e as Error).message);
      setRawJson(JSON.stringify({}, null, 2));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSave = async () => {
    setError(null);
    setSuccess(null);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      setError('Invalid JSON. Expected an object.');
      return;
    }

    setSaving(true);
    try {
      const data = await apiFetch('/admin/site-content/services-support', {
        method: 'PUT',
        headers: authHeader(token),
        body: JSON.stringify(parsed),
      });
      const next = (data as any)?.content;
      setRawJson(JSON.stringify(next ?? parsed, null, 2));
      setSuccess('Saved.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="rounded-2xl border bg-white shadow-sm p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Site Content</h1>
              <p className="mt-1 text-gray-600">Edit Services and Support page content.</p>
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
            <label className="text-sm font-medium text-gray-700">JSON</label>
            <div className="mt-2 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <textarea
                  value={rawJson}
                  onChange={(e) => setRawJson(e.target.value)}
                  className="w-full min-h-[520px] rounded-xl border p-3 font-mono text-sm bg-white"
                  spellCheck={false}
                />
              </div>

              <div className="rounded-xl border bg-gray-50 p-4">
                <div className="text-sm font-semibold text-gray-900">Validation</div>
                <div className="mt-2 text-sm text-gray-700">
                  {rawJson.trim() && !parsed ? (
                    <div className="text-red-700">Invalid JSON</div>
                  ) : (
                    <div className="text-green-700">Looks good</div>
                  )}
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  This controls:
                  <div className="mt-1 font-medium text-gray-900">/services</div>
                  <div className="font-medium text-gray-900">/support</div>
                </div>

                <div className="mt-6 rounded-lg border bg-white p-3 text-sm text-gray-700">
                  <div className="font-semibold text-gray-900">Expected fields</div>
                  <div className="mt-1">services: []</div>
                  <div>support: {`{ email, phone, whatsapp }`}</div>
                  <div>safety_rules: []</div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              Tip: keep phone numbers in international format (e.g. +355…).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
