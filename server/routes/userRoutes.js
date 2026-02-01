import express from 'express';
import { create, getById, getMe, list, remove, update } from '../controllers/userController.js';
import { adminRequired } from '../middleware/adminMiddleware.js';
import { authRequired } from '../middleware/authMiddleware.js';

export const userRouter = express.Router();

userRouter.get('/users/me', authRequired, getMe);

userRouter.get('/users', authRequired, adminRequired, list);
userRouter.post('/users', authRequired, adminRequired, create);

userRouter.get('/users/:id', authRequired, getById);
userRouter.put('/users/:id', authRequired, update);
userRouter.delete('/users/:id', authRequired, adminRequired, remove);
