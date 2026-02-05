import { useEffect, useState } from 'react';
import { apiFetch, authHeader } from '../services/api';
import { useAuth } from '../hooks/useAuth';

type Service = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
};

export function AdminServicesPage() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [services, setServices] = useState<Service[]>([]);

  const load = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const data = await apiFetch('/admin/site-content/services', { headers: authHeader(token) });
      setServices((data as any)?.services || []);
    } catch (e) {
      setError((e as Error).message);
      setServices([]);
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
      const data = await apiFetch('/admin/site-content/services', {
        method: 'PUT',
        headers: authHeader(token),
        body: JSON.stringify({ services }),
      });
      setServices((data as any)?.services || services);
      setSuccess('Services saved successfully.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const addService = () => {
    setServices([
      ...services,
      {
        id: `service_${Date.now()}`,
        title: '',
        subtitle: '',
        description: '',
        highlights: [],
      },
    ]);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: keyof Service, value: any) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const addHighlight = (serviceIndex: number) => {
    const updated = [...services];
    updated[serviceIndex].highlights = [...updated[serviceIndex].highlights, ''];
    setServices(updated);
  };

  const removeHighlight = (serviceIndex: number, highlightIndex: number) => {
    const updated = [...services];
    updated[serviceIndex].highlights = updated[serviceIndex].highlights.filter((_, i) => i !== highlightIndex);
    setServices(updated);
  };

  const updateHighlight = (serviceIndex: number, highlightIndex: number, value: string) => {
    const updated = [...services];
    updated[serviceIndex].highlights[highlightIndex] = value;
    setServices(updated);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="rounded-2xl border bg-white shadow-sm p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Services</h1>
              <p className="mt-1 text-gray-600">Add and edit service offerings displayed on the Services page.</p>
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

          <div className="mt-6 space-y-6">
            {services.map((service, serviceIdx) => (
              <div key={service.id} className="p-4 border rounded-xl bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Service {serviceIdx + 1}</h3>
                  <button
                    onClick={() => removeService(serviceIdx)}
                    className="px-3 py-1.5 rounded-md bg-red-100 text-red-700 text-sm hover:bg-red-200"
                  >
                    Remove Service
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID</label>
                    <input
                      type="text"
                      value={service.id}
                      onChange={(e) => updateService(serviceIdx, 'id', e.target.value)}
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="e.g., group_travel"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={service.title}
                      onChange={(e) => updateService(serviceIdx, 'title', e.target.value)}
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="e.g., Group Travel"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subtitle</label>
                    <input
                      type="text"
                      value={service.subtitle}
                      onChange={(e) => updateService(serviceIdx, 'subtitle', e.target.value)}
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="e.g., Families, friends, and small groups"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={service.description}
                      onChange={(e) => updateService(serviceIdx, 'description', e.target.value)}
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm min-h-[80px]"
                      placeholder="Service description"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Highlights</label>
                      <button
                        onClick={() => addHighlight(serviceIdx)}
                        className="px-2 py-1 rounded-md bg-gray-200 text-gray-700 text-xs hover:bg-gray-300"
                      >
                        + Add Highlight
                      </button>
                    </div>
                    <div className="space-y-2">
                      {service.highlights.map((highlight, highlightIdx) => (
                        <div key={highlightIdx} className="flex gap-2">
                          <input
                            type="text"
                            value={highlight}
                            onChange={(e) => updateHighlight(serviceIdx, highlightIdx, e.target.value)}
                            className="flex-1 rounded-md border px-3 py-2 text-sm"
                            placeholder="Highlight text"
                          />
                          <button
                            onClick={() => removeHighlight(serviceIdx, highlightIdx)}
                            className="px-3 py-2 rounded-md bg-red-100 text-red-700 text-sm hover:bg-red-200"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      {service.highlights.length === 0 && (
                        <p className="text-sm text-gray-500">No highlights yet. Click "+ Add Highlight" to add one.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {services.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                No services yet. Click "Add Service" to create one.
              </div>
            )}
          </div>

          <button
            onClick={addService}
            className="mt-6 w-full py-3 rounded-md border-2 border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
          >
            + Add Service
          </button>
        </div>
      </div>
    </div>
  );
}
