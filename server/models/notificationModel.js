import { pool } from '../config/db.js';

export async function createNotification({ userId, title, message, type, metadata }) {
  const result = await pool.query(
    `insert into public.notifications 
    (user_id, title, message, type, metadata) 
    values ($1, $2, $3, $4, $5) 
    returning *`,
    [userId, title, message, type, metadata || {}]
  );
  return result.rows[0];
}

export async function getUserNotifications(userId, limit = 50) {
  const result = await pool.query(
    `select * from public.notifications 
    where user_id = $1 
    order by created_at desc 
    limit $2`,
    [userId, limit]
  );
  return result.rows;
}

export async function getUnreadCount(userId) {
  const result = await pool.query(
    `select count(*) from public.notifications where user_id=$1 and is_read=false`,
    [userId]
  );
  return parseInt(result.rows[0].count, 10);
}

export async function markAsRead(id, userId) {
  const result = await pool.query(
    `update public.notifications set is_read=true where id=$1 and user_id=$2 returning *`,
    [id, userId]
  );
  return result.rows[0];
}

export async function markAllAsRead(userId) {
  const result = await pool.query(
    `update public.notifications set is_read=true where user_id=$1 returning id`,
    [userId]
  );
  return result.rowCount;
}
