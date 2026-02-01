import express from 'express';
import { listMe, toggle } from '../controllers/favoriteController.js';
import { authRequired } from '../middleware/authMiddleware.js';

export const favoriteRouter = express.Router();

favoriteRouter.get('/favorites', authRequired, listMe);
favoriteRouter.post('/favorites/toggle', authRequired, toggle);
