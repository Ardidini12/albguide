import crypto from 'crypto';
import { getSupabaseAdmin, getSupabaseBucket } from '../config/supabase.js';
import { createSignedReadUrl } from './storageService.js';
import { findReviewById } from '../models/reviewModel.js';
import { countReviewImages, createReviewImage } from '../models/reviewImageModel.js';

function getExtensionFromMime(mime) {
  const m = String(mime || '').toLowerCase();
  if (m === 'image/jpeg') return 'jpg';
  if (m === 'image/png') return 'png';
  if (m === 'image/webp') return 'webp';
  if (m === 'image/gif') return 'gif';
  return '';
}

export async function signReviewImageUpload({ reviewId, userId, contentType, maxPerReview = 5 }) {
  const review = await findReviewById(reviewId);
  if (!review) {
    const err = new Error('Review not found');
    err.statusCode = 404;
    throw err;
  }

  if (String(review.user_id) !== String(userId)) {
    const err = new Error('Not allowed');
    err.statusCode = 403;
    throw err;
  }

  const currentCount = await countReviewImages(reviewId);
  if (currentCount >= maxPerReview) {
    const err = new Error(`Upload limit reached (max ${maxPerReview} images per review)`);
    err.statusCode = 400;
    throw err;
  }

  const ext = getExtensionFromMime(contentType);
  if (!ext) {
    const err = new Error('Unsupported image type');
    err.statusCode = 400;
    throw err;
  }

  const bucket = getSupabaseBucket();
  const supabase = getSupabaseAdmin();

  const randomName = crypto.randomBytes(16).toString('hex');
  const path = `reviews/${reviewId}/${randomName}.${ext}`;

  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
  if (error || !data?.token) {
    const err = new Error('Unable to create signed upload URL');
    err.statusCode = 500;
    throw err;
  }

  const signedReadUrl = await createSignedReadUrl(path, 3600);

  return {
    bucket,
    path,
    token: data.token,
    signedUrl: data.signedUrl,
    signedReadUrl,
  };
}

export async function registerReviewImage({ reviewId, userId, path }) {
  const review = await findReviewById(reviewId);
  if (!review) {
    const err = new Error('Review not found');
    err.statusCode = 404;
    throw err;
  }

  if (String(review.user_id) !== String(userId)) {
    const err = new Error('Not allowed');
    err.statusCode = 403;
    throw err;
  }

  if (!path) {
    const err = new Error('path is required');
    err.statusCode = 400;
    throw err;
  }

  if (!String(path).startsWith(`reviews/${reviewId}/`)) {
    const err = new Error('Invalid path');
    err.statusCode = 400;
    throw err;
  }

  return await createReviewImage({ reviewId, userId, path });
}
