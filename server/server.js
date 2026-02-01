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

app.get('/', (req, res) => {
  res.send('Albania Guide API');
});

mountRoutes(app);

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