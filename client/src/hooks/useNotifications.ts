import { useEffect, useState, useCallback, useRef } from 'react';
import { getUserNotifications, markRead, markAllRead, type Notification } from '../services/notifications';

export function useNotifications(token: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getUserNotifications(token);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      setIsConnected(false);
      return;
    }

    fetchNotifications();

    // SSE Connection
    // Using query param for token
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/notifications/stream?token=${token}`;
    const es = new EventSource(url);

    es.onopen = () => {
      setIsConnected(true);
      console.log('SSE Connected');
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'connected') return;

        // Add new notification to list
        setNotifications(prev => [data, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Optional: Trigger a toast or sound here
        console.log('New notification:', data);
      } catch (err) {
        console.error('Error parsing SSE message', err);
      }
    };

    es.onerror = (_err) => {
      // console.error('SSE Error', err);
      es.close();
      setIsConnected(false);
      // Reconnect logic is handled by browser for typical network errors, 
      // but if closed server-side or auth fail, we might need manual retry or just let it be.
      // EventSource auto-reconnects by default.
    };

    eventSourceRef.current = es;

    return () => {
      es.close();
      setIsConnected(false);
    };
  }, [token, fetchNotifications]);

  const markAsReadHandler = async (id: string) => {
    if (!token) return;
    try {
      await markRead(id, token);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllReadHandler = async () => {
    if (!token) return;
    try {
      await markAllRead(token);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead: markAsReadHandler,
    markAllRead: markAllReadHandler,
    refresh: fetchNotifications
  };
}
