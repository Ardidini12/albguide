import express from 'express';
import {
  createAdmin,
  getById,
  getBySlug,
  listAdmin,
  listPublic,
  removeAdmin,
  updateAdmin,
} from '../controllers/destinationController.js';
import { adminRequired } from '../middleware/adminMiddleware.js';
import { authRequired } from '../middleware/authMiddleware.js';

export const destinationRouter = express.Router();

destinationRouter.get('/destinations', listPublic);
destinationRouter.get('/destinations/slug/:slug', getBySlug);
destinationRouter.get('/destinations/:id', getById);

destinationRouter.get('/admin/destinations', authRequired, adminRequired, listAdmin);
destinationRouter.post('/admin/destinations', authRequired, adminRequired, createAdmin);
destinationRouter.put('/admin/destinations/:id', authRequired, adminRequired, updateAdmin);
destinationRouter.delete('/admin/destinations/:id', authRequired, adminRequired, removeAdmin);
