import express from 'express';
import { dbHealth, health } from '../controllers/healthController.js';

export const healthRouter = express.Router();

healthRouter.get('/health', health);
healthRouter.get('/health/db', dbHealth);
