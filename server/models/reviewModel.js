import { pool } from '../config/db.js';

export async function createReview({ bookingId, userId, packageId, rating, title, body, moderationStatus }) {
  const result = await pool.query(
    `insert into public.reviews (
      booking_id,
      user_id,
      package_id,
      rating,
      title,
      body,
      moderation_status
    ) values ($1,$2,$3,$4,$5,$6,$7)
    returning *`,
    [bookingId, userId, packageId, rating, title || null, body, moderationStatus || 'pending']
  );
  return result.rows[0];
}

export async function findReviewById(id) {
  const result = await pool.query('select * from public.reviews where id=$1', [id]);
  return result.rows[0] || null;
}

export async function listReviewsByPackage({ packageId, includeAll = false } = {}) {
  const where = ['r.package_id=$1'];
  const values = [packageId];

  if (!includeAll) {
    where.push(`r.moderation_status='approved'`);
  }

  const result = await pool.query(
    `select r.*, u.name as user_name, u.email as user_email
     from public.reviews r
     join public.users u on u.id = r.user_id
     where ${where.join(' and ')}
     order by r.created_at desc`,
    values
  );

  return result.rows;
}

export async function listReviewsAdmin() {
  const result = await pool.query(
    `select r.*, u.name as user_name, u.email as user_email
     from public.reviews r
     join public.users u on u.id = r.user_id
     order by r.created_at desc`
  );
  return result.rows;
}

export async function updateReviewById(id, { moderationStatus }) {
  const fields = [];
  const values = [];
  let i = 1;

  if (moderationStatus !== undefined) {
    fields.push(`moderation_status=$${i++}`);
    values.push(moderationStatus);
  }

  if (!fields.length) {
    return await findReviewById(id);
  }

  fields.push('updated_at=now()');
  values.push(id);

  const result = await pool.query(
    `update public.reviews set ${fields.join(', ')} where id=$${i} returning *`,
    values
  );

  return result.rows[0] || null;
}
