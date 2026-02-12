import { apiFetch, authHeader } from './api';

export interface Offer {
  id: string;
  title: string;
  description: string;
  discount_percentage: number;
  code?: string;
  valid_from?: string;
  valid_to?: string;
  is_active: boolean;
  created_at: string;
}

export async function getOffers(token?: string) {
  return await apiFetch('/offers', {
    headers: token ? authHeader(token) : {},
  });
}

export async function createOffer(data: any, token: string) {
  return await apiFetch('/offers', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: authHeader(token),
  });
}

export async function updateOffer(id: string, data: any, token: string) {
  return await apiFetch(`/offers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: authHeader(token),
  });
}

export async function deleteOffer(id: string, token: string) {
  return await apiFetch(`/offers/${id}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
}
