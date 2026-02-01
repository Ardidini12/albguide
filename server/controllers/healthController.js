import { pool } from '../config/db.js';

export function health(req, res) {
  res.json({ status: 'ok' });
}

export async function dbHealth(req, res) {
  try {
    const result = await pool.query('select 1 as ok');
    res.json({ status: 'ok', db: result.rows[0]?.ok === 1 });
  } catch {
    res.status(503).json({ status: 'error', db: false, message: 'Database unreachable' });
  }
}
