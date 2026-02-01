import { pool } from '../config/db.js';

export async function listFavoritesByUser(userId) {
  const result = await pool.query(
    `select f.package_id, f.created_at
     from public.favorites f
     where f.user_id=$1
     order by f.created_at desc`,
    [userId]
  );
  return result.rows;
}

export async function isFavorite({ userId, packageId }) {
  const result = await pool.query(
    'select 1 from public.favorites where user_id=$1 and package_id=$2',
    [userId, packageId]
  );
  return result.rowCount > 0;
}

export async function addFavorite({ userId, packageId }) {
  const result = await pool.query(
    `insert into public.favorites (user_id, package_id)
     values ($1,$2)
     on conflict (user_id, package_id) do nothing
     returning *`,
    [userId, packageId]
  );
  return result.rows[0] || null;
}

export async function removeFavorite({ userId, packageId }) {
  const result = await pool.query(
    'delete from public.favorites where user_id=$1 and package_id=$2 returning user_id, package_id',
    [userId, packageId]
  );
  return result.rows[0] || null;
}
