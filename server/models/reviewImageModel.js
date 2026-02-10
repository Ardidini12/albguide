import { pool } from '../config/db.js';

export async function countReviewImages(reviewId) {
  const result = await pool.query('select count(*)::int as count from public.review_images where review_id=$1', [reviewId]);
  return result.rows[0]?.count || 0;
}

export async function createReviewImage({ reviewId, userId, path, fileType, fileSize }) {
  const result = await pool.query(
    `insert into public.review_images (review_id, user_id, path, file_type, file_size)
     values ($1,$2,$3,$4,$5)
     returning *`,
    [reviewId, userId, path, fileType || 'image', fileSize || 0]
  );
  return result.rows[0];
}

export async function listReviewImagesByReview(reviewId) {
  const result = await pool.query(
    `select *
     from public.review_images
     where review_id=$1
     order by created_at desc`,
    [reviewId]
  );
  return result.rows;
}

export async function getTotalFileSizeByReview(reviewId) {
  const result = await pool.query(
    'select coalesce(sum(file_size), 0)::bigint as total from public.review_images where review_id=$1',
    [reviewId]
  );
  return Number(result.rows[0]?.total || 0);
}

export async function deleteReviewImage(id, userId) {
  const result = await pool.query(
    'delete from public.review_images where id=$1 and user_id=$2 returning *',
    [id, userId]
  );
  return result.rows[0] || null;
}
