import express from 'express';
import { createAdmin, getById, getBySlug, listAdmin, listPublic, removeAdmin, updateAdmin } from '../controllers/packageController.js';
import { adminRequired } from '../middleware/adminMiddleware.js';
import { authRequired } from '../middleware/authMiddleware.js';

export const packageRouter = express.Router();

packageRouter.get('/packages', listPublic);
packageRouter.get('/packages/slug/:slug', getBySlug);
packageRouter.get('/packages/:id', getById);

packageRouter.get('/admin/packages', authRequired, adminRequired, listAdmin);
packageRouter.post('/admin/packages', authRequired, adminRequired, createAdmin);
packageRouter.put('/admin/packages/:id', authRequired, adminRequired, updateAdmin);
packageRouter.delete('/admin/packages/:id', authRequired, adminRequired, removeAdmin);
