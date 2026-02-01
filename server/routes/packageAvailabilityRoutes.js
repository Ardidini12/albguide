import express from 'express';
import { listAdmin, listPublic, removeAdmin, updateAdmin, upsertAdmin } from '../controllers/packageAvailabilityController.js';
import { adminRequired } from '../middleware/adminMiddleware.js';
import { authRequired } from '../middleware/authMiddleware.js';

export const packageAvailabilityRouter = express.Router();

packageAvailabilityRouter.get('/packages/:packageId/availability', listPublic);

packageAvailabilityRouter.get('/admin/packages/:packageId/availability', authRequired, adminRequired, listAdmin);
packageAvailabilityRouter.post('/admin/packages/:packageId/availability', authRequired, adminRequired, upsertAdmin);
packageAvailabilityRouter.put('/admin/availability/:id', authRequired, adminRequired, updateAdmin);
packageAvailabilityRouter.delete('/admin/availability/:id', authRequired, adminRequired, removeAdmin);
