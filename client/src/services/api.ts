const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function apiFetch(path: string, init: RequestInit = {}) {
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(init.headers || {}),
    },
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
