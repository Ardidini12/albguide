import express from 'express';
import { getAdmin, getPublic, removeAdmin, upsertAdmin, checkDate } from '../controllers/packageAvailabilityController.js';
import { adminRequired } from '../middleware/adminMiddleware.js';
import { authRequired } from '../middleware/authMiddleware.js';

export const packageAvailabilityRouter = express.Router();

packageAvailabilityRouter.get('/packages/:packageId/availability', getPublic);
packageAvailabilityRouter.get('/packages/:packageId/availability/check', checkDate);

packageAvailabilityRouter.get('/admin/packages/:packageId/availability', authRequired, adminRequired, getAdmin);
packageAvailabilityRouter.post('/admin/packages/:packageId/availability', authRequired, adminRequired, upsertAdmin);
packageAvailabilityRouter.delete('/admin/packages/:packageId/availability', authRequired, adminRequired, removeAdmin);
