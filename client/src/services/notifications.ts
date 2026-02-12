import { apiFetch, authHeader } from './api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  metadata: any;
  created_at: string;
}

export async function getUserNotifications(token: string) {
  return await apiFetch('/notifications', {
    headers: authHeader(token),
  });
}

export async function markRead(id: string, token: string) {
  return await apiFetch(`/notifications/${id}/read`, {
    method: 'POST',
    headers: authHeader(token),
  });
}

export async function markAllRead(token: string) {
  return await apiFetch('/notifications/all/read', {
    method: 'POST',
    headers: authHeader(token),
  });
}
