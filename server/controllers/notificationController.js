import * as service from '../services/notificationService.js';
import * as model from '../models/notificationModel.js';
import { verifyToken } from '../services/jwtService.js';
import { findUserById } from '../models/userModel.js';

export async function connectSSE(req, res) {
  const token = req.query.token;
  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }

  let user;
  try {
    const payload = verifyToken(token);
    user = await findUserById(payload.sub);
    if (!user) throw new Error('User not found');
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  // SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*' // Adjust if needed
  });

  // Initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  // Heartbeat
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  service.addClient(user.id, res);

  req.on('close', () => {
    clearInterval(heartbeat);
    service.removeClient(user.id, res);
  });
}

export async function list(req, res) {
  try {
    const notifications = await model.getUserNotifications(req.user.sub);
    const unreadCount = await model.getUnreadCount(req.user.sub);
    return res.json({ notifications, unreadCount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function markRead(req, res) {
  try {
    const { id } = req.params;
    if (id === 'all') {
      await model.markAllAsRead(req.user.sub);
      return res.json({ message: 'All marked as read' });
    }
    const notification = await model.markAsRead(id, req.user.sub);
    return res.json({ notification });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
