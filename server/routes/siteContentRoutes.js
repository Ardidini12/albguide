import express from 'express';
import { getServicesSupport, updateServicesSupport, getServices, updateServices, getSupport, updateSupport } from '../controllers/siteContentController.js';
import { adminRequired } from '../middleware/adminMiddleware.js';
import { authRequired } from '../middleware/authMiddleware.js';

export const siteContentRouter = express.Router();

siteContentRouter.get('/site-content/services-support', getServicesSupport);

siteContentRouter.get('/admin/site-content/services-support', authRequired, adminRequired, getServicesSupport);
siteContentRouter.put('/admin/site-content/services-support', authRequired, adminRequired, updateServicesSupport);

// Separate endpoints for services and support
siteContentRouter.get('/admin/site-content/services', authRequired, adminRequired, getServices);
siteContentRouter.put('/admin/site-content/services', authRequired, adminRequired, updateServices);

siteContentRouter.get('/admin/site-content/support', authRequired, adminRequired, getSupport);
siteContentRouter.put('/admin/site-content/support', authRequired, adminRequired, updateSupport);
