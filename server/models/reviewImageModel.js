import { pool } from '../config/db.js';

export async function countReviewImages(reviewId) {
  const result = await pool.query('select count(*)::int as count from public.review_images where review_id=$1', [reviewId]);
  return result.rows[0]?.count || 0;
}

export async function createReviewImage({ reviewId, userId, path }) {
  const result = await pool.query(
    `insert into public.review_images (review_id, user_id, path)
     values ($1,$2,$3)
     returning *`,
    [reviewId, userId, path]
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
