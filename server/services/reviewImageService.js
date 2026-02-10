import crypto from 'crypto';
import { getSupabaseAdmin, getSupabaseBucket } from '../config/supabase.js';
import { createSignedReadUrl, deleteFromStorage } from './storageService.js';
import { findReviewById } from '../models/reviewModel.js';
import { countReviewImages, createReviewImage, deleteReviewImage, getTotalFileSizeByReview, listReviewImagesByReview } from '../models/reviewImageModel.js';
import { validateVideoDuration } from '../utils/videoValidator.js';

function getExtensionFromMime(mime) {
  const m = String(mime || '').toLowerCase();
  if (m === 'image/jpeg') return 'jpg';
  if (m === 'image/png') return 'png';
  if (m === 'image/webp') return 'webp';
  if (m === 'image/gif') return 'gif';
  if (m === 'video/mp4') return 'mp4';
  if (m === 'video/webm') return 'webm';
  if (m === 'video/quicktime') return 'mov';
  return '';
}

export async function signReviewImageUpload({ reviewId, userId, contentType, fileType, fileSize, videoDuration, maxPerReview = 20 }) {
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
    const err = new Error(`Upload limit reached (max ${maxPerReview} files per review)`);
    err.statusCode = 400;
    throw err;
  }

  const MAX_TOTAL_SIZE = 50 * 1024 * 1024;
  const currentSize = await getTotalFileSizeByReview(reviewId);
  const newSize = Number(fileSize || 0);
  
  if (currentSize + newSize > MAX_TOTAL_SIZE) {
    const err = new Error(`Total file size would exceed 50MB limit. Current: ${(currentSize / 1024 / 1024).toFixed(2)}MB`);
    err.statusCode = 400;
    throw err;
  }

  const ext = getExtensionFromMime(contentType);
  if (!ext) {
    const err = new Error('Unsupported file type');
    err.statusCode = 400;
    throw err;
  }

  if (fileType === 'video') {
    if (videoDuration === undefined || videoDuration === null) {
      const err = new Error('video_duration is required for video uploads');
      err.statusCode = 400;
      throw err;
    }
    validateVideoDuration(videoDuration, 30);
  }

  const bucket = getSupabaseBucket();
  const supabase = getSupabaseAdmin();

  const randomName = crypto.randomBytes(16).toString('hex');
  const folder = fileType === 'video' ? 'videos' : 'images';
  const path = `reviews/${reviewId}/${folder}/${randomName}.${ext}`;

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
    uploadUrl: data.signedUrl,
    signedReadUrl,
  };
}

export async function registerReviewImage({ reviewId, userId, path, fileType, fileSize }) {
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

  return await createReviewImage({ 
    reviewId, 
    userId, 
    path,
    fileType: fileType || 'image',
    fileSize: Number(fileSize || 0)
  });
}

export async function deleteReviewImageForUser({ reviewId, imageId, userId }) {
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

  const images = await listReviewImagesByReview(reviewId);
  const imageToDelete = images.find(img => String(img.id) === String(imageId));
  
  if (imageToDelete && imageToDelete.path) {
    const result = await deleteFromStorage(imageToDelete.path);
    // Ignore 404 errors - file already deleted is fine
    if (!result.success && result.error?.statusCode !== '404') {
      console.warn('Failed to delete review image from storage:', result.error);
    }
  }

  return await deleteReviewImage(imageId, userId);
}
