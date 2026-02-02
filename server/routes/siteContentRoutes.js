import express from 'express';
import { getServicesSupport, updateServicesSupport } from '../controllers/siteContentController.js';
import { adminRequired } from '../middleware/adminMiddleware.js';
import { authRequired } from '../middleware/authMiddleware.js';

export const siteContentRouter = express.Router();

siteContentRouter.get('/site-content/services-support', getServicesSupport);

siteContentRouter.get('/admin/site-content/services-support', authRequired, adminRequired, getServicesSupport);
siteContentRouter.put('/admin/site-content/services-support', authRequired, adminRequired, updateServicesSupport);
