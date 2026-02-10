const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const pendingGetRequests = new Map<string, Promise<any>>();
const recentGetResponses = new Map<string, { expiresAt: number; data: any }>();

function getHeaderValue(headers: HeadersInit | undefined, name: string) {
  if (!headers) return undefined;
  if (headers instanceof Headers) return headers.get(name);
  if (Array.isArray(headers)) {
    const found = headers.find(([k]) => String(k).toLowerCase() === name.toLowerCase());
    return found?.[1];
  }
  const obj = headers as Record<string, string>;
  const foundKey = Object.keys(obj).find(k => k.toLowerCase() === name.toLowerCase());
  return foundKey ? obj[foundKey] : undefined;
}

function getGetDedupeKey(path: string, init: RequestInit) {
  const auth = getHeaderValue(init.headers, 'authorization') || '';
  return `GET ${API_URL}${path} AUTH:${auth}`;
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const method = String(init.method || 'GET').toUpperCase();
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;

  const clientRoute = typeof window !== 'undefined' ? window.location?.pathname : undefined;

  if (method === 'GET' && init.body == null) {
    const key = getGetDedupeKey(path, init);
    const now = Date.now();
    const recent = recentGetResponses.get(key);
    if (recent && recent.expiresAt > now) return recent.data;

    const pending = pendingGetRequests.get(key);
    if (pending) return pending;

    const p = (async () => {
      try {
        const headers = new Headers(init.headers || {});
        if (clientRoute) headers.set('X-Client-Route', clientRoute);
        if (!isFormData && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

        const res = await fetch(`${API_URL}${path}`, {
          ...init,
          headers,
        });

        const text = await res.text();
        const data = text ? (() => {
          try {
            return JSON.parse(text);
          } catch {
            return text;
          }
        })() : null;

        if (!res.ok) {
          const message = (data as any)?.message || `Request failed (${res.status})`;
          throw new Error(message);
        }

        recentGetResponses.set(key, { expiresAt: Date.now() + 250, data });
        return data;
      } finally {
        pendingGetRequests.delete(key);
      }
    })();

    pendingGetRequests.set(key, p);
    return p;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: (() => {
      const headers = new Headers(init.headers || {});
      if (clientRoute) headers.set('X-Client-Route', clientRoute);
      if (!isFormData && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
      return headers;
    })(),
  });

  const text = await res.text();
  const data = text ? (() => {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  })() : null;

  if (!res.ok) {
    const message = (data as any)?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export function authHeader(token: string | null): HeadersInit {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
