import { createReviewForBooking, listReviewsAdminAll, listReviewsPublic, updateReviewModerationAdmin } from '../services/reviewService.js';

export async function listByPackage(req, res) {
  try {
    const reviews = await listReviewsPublic({ packageId: req.params.packageId });
    return res.json({ reviews });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function create(req, res) {
  try {
    const review = await createReviewForBooking({
      bookingId: req.body?.booking_id,
      userId: req.user.sub,
      packageId: req.body?.package_id,
      rating: req.body?.rating,
      title: req.body?.title,
      body: req.body?.body,
    });

    return res.status(201).json({ review });
  } catch (err) {
    if (String(err?.code) === '23505') {
      return res.status(409).json({ message: 'You already reviewed this booking' });
    }
    if (err?.statusCode) {
      return res.status(err.statusCode).json({ message: err.message || 'Bad request' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function listAdmin(req, res) {
  try {
    const reviews = await listReviewsAdminAll();
    return res.json({ reviews });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateModerationAdmin(req, res) {
  try {
    const review = await updateReviewModerationAdmin(req.params.id, req.body?.moderation_status);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    return res.json({ review });
  } catch (err) {
    if (err?.statusCode) {
      return res.status(err.statusCode).json({ message: err.message || 'Bad request' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
