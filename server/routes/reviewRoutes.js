import express from 'express';
import { create, deleteAdmin, deleteMe, listAdmin, listByPackage, listMe, updateMe, updateModerationAdmin } from '../controllers/reviewController.js';
import { create as createImage, deleteImage, sign as signImage } from '../controllers/reviewImageController.js';
import { adminRequired } from '../middleware/adminMiddleware.js';
import { authRequired } from '../middleware/authMiddleware.js';

export const reviewRouter = express.Router();

reviewRouter.get('/packages/:packageId/reviews', listByPackage);
reviewRouter.post('/reviews', authRequired, create);
reviewRouter.get('/reviews/me', authRequired, listMe);
reviewRouter.put('/reviews/:id', authRequired, updateMe);
reviewRouter.delete('/reviews/:id', authRequired, deleteMe);

reviewRouter.post('/reviews/:reviewId/images/sign', authRequired, signImage);
reviewRouter.post('/reviews/:reviewId/images', authRequired, createImage);
reviewRouter.delete('/reviews/:reviewId/images/:imageId', authRequired, deleteImage);

reviewRouter.get('/admin/reviews', authRequired, adminRequired, listAdmin);
reviewRouter.put('/admin/reviews/:id', authRequired, adminRequired, updateModerationAdmin);
reviewRouter.delete('/admin/reviews/:id', authRequired, adminRequired, deleteAdmin);
