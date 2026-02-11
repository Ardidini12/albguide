import express from 'express';
import 'dotenv/config';
import cors from 'cors';

import { ensureSchema } from './config/db.js';
import { mountRoutes } from './routes/index.js';
import { seedSuperuser } from './services/adminService.js';

const app = express();

const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const startNs = process.hrtime.bigint();

  const clientRoute = req.get('x-client-route');
  const displayUrl = clientRoute || req.originalUrl;

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startNs) / 1e6;
    console.log(`${req.method} ${displayUrl} -> ${res.statusCode} (${durationMs.toFixed(1)}ms)`);
  });

  next();
});

app.get('/', (req, res) => {
  res.status(200).send('Albania Guide API');
});

const api = express.Router();
mountRoutes(api);
app.use('/api/v1', api);

app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  if (res.headersSent) return next(err);
  return res.status(500).json({ message: 'Internal server error' });
});

async function start() {
  try {
    await ensureSchema();
  } catch (err) {
    console.error('Database schema initialization failed', err);
    process.exitCode = 1;
    return;
  }

  try {
    await seedSuperuser();
  } catch (err) {
    console.error('Superuser seed failed', err);
  }

  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

start();