import express from 'express';
import { create, listAdmin, listByPackage, updateModerationAdmin } from '../controllers/reviewController.js';
import { create as createImage, sign as signImage } from '../controllers/reviewImageController.js';
import { adminRequired } from '../middleware/adminMiddleware.js';
import { authRequired } from '../middleware/authMiddleware.js';

export const reviewRouter = express.Router();

reviewRouter.get('/packages/:packageId/reviews', listByPackage);
reviewRouter.post('/reviews', authRequired, create);

reviewRouter.post('/reviews/:reviewId/images/sign', authRequired, signImage);
reviewRouter.post('/reviews/:reviewId/images', authRequired, createImage);

reviewRouter.get('/admin/reviews', authRequired, adminRequired, listAdmin);
reviewRouter.put('/admin/reviews/:id', authRequired, adminRequired, updateModerationAdmin);
