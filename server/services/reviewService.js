import { createSignedReadUrl, isLikelyExternalUrl } from './storageService.js';
import { findBookingById } from '../models/bookingModel.js';
import { createReview, listReviewsAdmin, listReviewsByPackage, updateReviewById } from '../models/reviewModel.js';
import { listReviewImagesByReview } from '../models/reviewImageModel.js';

async function decorateImagePath(path) {
  if (!path) return null;
  if (isLikelyExternalUrl(path)) return path;
  return await createSignedReadUrl(path, 3600);
}

export async function listReviewsPublic({ packageId }) {
  const reviews = await listReviewsByPackage({ packageId, includeAll: false });

  const decorated = [];
  for (const r of reviews) {
    const images = await listReviewImagesByReview(r.id);
    const imageUrls = [];
    for (const img of images) {
      const url = await decorateImagePath(img.path);
      if (url) imageUrls.push({ url, path: img.path, created_at: img.created_at });
    }

    decorated.push({
      ...r,
      images: imageUrls,
    });
  }

  return decorated;
}

export async function listReviewsAdminAll() {
  return await listReviewsAdmin();
}

export async function createReviewForBooking({ bookingId, userId, packageId, rating, title, body }) {
  if (!bookingId) {
    const err = new Error('booking_id is required');
    err.statusCode = 400;
    throw err;
  }

  const booking = await findBookingById(bookingId);
  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }

  if (String(booking.user_id || '') !== String(userId || '')) {
    const err = new Error('Not allowed');
    err.statusCode = 403;
    throw err;
  }

  if (String(booking.package_id) !== String(packageId)) {
    const err = new Error('booking_id does not match package_id');
    err.statusCode = 400;
    throw err;
  }

  if (booking.status !== 'completed') {
    const err = new Error('Reviews are allowed only after the booking is completed');
    err.statusCode = 400;
    throw err;
  }

  const r = Number(rating);
  if (!Number.isFinite(r) || r < 1 || r > 5) {
    const err = new Error('rating must be between 1 and 5');
    err.statusCode = 400;
    throw err;
  }

  if (!body) {
    const err = new Error('body is required');
    err.statusCode = 400;
    throw err;
  }

  return await createReview({
    bookingId,
    userId,
    packageId,
    rating: r,
    title,
    body,
    moderationStatus: 'pending',
  });
}

export async function updateReviewModerationAdmin(id, moderationStatus) {
  return await updateReviewById(id, { moderationStatus });
}
