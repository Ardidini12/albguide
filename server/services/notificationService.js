import { createNotification } from '../models/notificationModel.js';
import { listAdmins } from '../models/userModel.js';

// Store active connections: userId -> Set of Response objects
const clients = new Map();

export function addClient(userId, res) {
  if (!userId) return;
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }
  clients.get(userId).add(res);

  // Remove when connection closes
  res.on('close', () => {
    removeClient(userId, res);
  });
}

export function removeClient(userId, res) {
  if (clients.has(userId)) {
    clients.get(userId).delete(res);
    if (clients.get(userId).size === 0) {
      clients.delete(userId);
    }
  }
}

// Send event to specific user
export function sendSSE(userId, data) {
  if (clients.has(userId)) {
    clients.get(userId).forEach(res => {
      // Format: data: <json>\n\n
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  }
}

export async function notifyUser(userId, title, message, type = 'system', metadata = {}) {
  try {
    // 1. Save to DB
    const notification = await createNotification({ userId, title, message, type, metadata });

    // 2. Push via SSE
    sendSSE(userId, notification);

    return notification;
  } catch (err) {
    console.error('Error in notifyUser:', err);
  }
}

export async function notifyAdmins(title, message, type = 'system', metadata = {}) {
  try {
    // 1. Get all admins
    const admins = await listAdmins();
    
    // 2. Create notification for each admin and push
    const promises = admins.map(async (admin) => {
      const notification = await createNotification({ 
        userId: admin.id, 
        title, 
        message, 
        type, 
        metadata 
      });
      sendSSE(admin.id, notification); // We use admin.id which is the userId
    });

    await Promise.all(promises);
  } catch (err) {
    console.error('Error in notifyAdmins:', err);
  }
}
