import express from 'express';
import { create, listAdmin, listMe, updateStatusAdmin } from '../controllers/bookingController.js';
import { adminRequired } from '../middleware/adminMiddleware.js';
import { authRequired } from '../middleware/authMiddleware.js';
import { optionalAuth } from '../middleware/optionalAuthMiddleware.js';
import { rateLimit } from '../middleware/rateLimitMiddleware.js';

export const bookingRouter = express.Router();

bookingRouter.post('/bookings', rateLimit({ windowMs: 60_000, max: 10 }), optionalAuth, create);
bookingRouter.get('/bookings/me', authRequired, listMe);

bookingRouter.get('/admin/bookings', authRequired, adminRequired, listAdmin);
bookingRouter.put('/admin/bookings/:id', authRequired, adminRequired, updateStatusAdmin);
