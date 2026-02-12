import express from 'express';
import { authRequired } from '../middleware/authMiddleware.js';
import * as controller from '../controllers/notificationController.js';

const router = express.Router();

router.get('/stream', controller.connectSSE); // Auth handled via query param
router.get('/', authRequired, controller.list);
router.post('/:id/read', authRequired, controller.markRead);

export const notificationRouter = router;
