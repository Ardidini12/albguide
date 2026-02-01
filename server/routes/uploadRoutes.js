import express from 'express';
import { createReadUrl, uploadMedia } from '../controllers/uploadController.js';
import { adminRequired } from '../middleware/adminMiddleware.js';
import { authRequired } from '../middleware/authMiddleware.js';

export const uploadRouter = express.Router();

uploadRouter.post('/admin/uploads/sign', authRequired, adminRequired, uploadMedia);
uploadRouter.post('/admin/uploads/read-url', authRequired, adminRequired, createReadUrl);
