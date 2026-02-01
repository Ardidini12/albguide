import { registerReviewImage, signReviewImageUpload } from '../services/reviewImageService.js';

export async function sign(req, res) {
  try {
    const result = await signReviewImageUpload({
      reviewId: req.params.reviewId,
      userId: req.user.sub,
      contentType: req.body?.contentType,
    });

    return res.status(201).json(result);
  } catch (err) {
    if (err?.statusCode) {
      return res.status(err.statusCode).json({ message: err.message || 'Bad request' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function create(req, res) {
  try {
    const image = await registerReviewImage({
      reviewId: req.params.reviewId,
      userId: req.user.sub,
      path: req.body?.path,
    });

    return res.status(201).json({ image });
  } catch (err) {
    if (err?.statusCode) {
      return res.status(err.statusCode).json({ message: err.message || 'Bad request' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
