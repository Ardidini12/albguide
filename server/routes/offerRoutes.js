import express from 'express';
import { authRequired, optionalAuth } from '../middleware/authMiddleware.js';
import * as controller from '../controllers/offerController.js';

const router = express.Router();

// Public read, but admin sees more
router.get('/', optionalAuth, controller.list);

// Admin only (need admin middleware? For now authRequired + check inside controller or add admin middleware)
// db.js RLS checks for is_admin, but API should also check.
// controller.create uses service.create which uses model. 
// We should protect these routes.
// For now I'll use authRequired and let controller/service handle it, but better:
import { verifyToken } from '../services/jwtService.js';

function adminRequired(req, res, next) {
  authRequired(req, res, async () => {
    if (!req.user?.is_admin) {
      return res.status(403).json({ message: 'Admin required' });
    }
    next();
  });
}

router.post('/', adminRequired, controller.create);
router.put('/:id', adminRequired, controller.update);
router.delete('/:id', adminRequired, controller.destroy);

export const offerRouter = router;
