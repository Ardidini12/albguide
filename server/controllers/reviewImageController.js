import { deleteReviewImageForUser, registerReviewImage, signReviewImageUpload } from '../services/reviewImageService.js';

export async function sign(req, res) {
  try {
    const result = await signReviewImageUpload({
      reviewId: req.params.reviewId,
      userId: req.user.sub,
      contentType: req.body?.contentType,
      fileType: req.body?.file_type,
      fileSize: req.body?.file_size,
      videoDuration: req.body?.video_duration,
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
      fileType: req.body?.file_type,
      fileSize: req.body?.file_size,
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

export async function deleteImage(req, res) {
  try {
    const image = await deleteReviewImageForUser({
      reviewId: req.params.reviewId,
      imageId: req.params.imageId,
      userId: req.user.sub,
    });
    if (!image) return res.status(404).json({ message: 'Image not found or not authorized' });
    return res.json({ message: 'Image deleted' });
  } catch (err) {
    if (err?.statusCode) {
      return res.status(err.statusCode).json({ message: err.message || 'Bad request' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
