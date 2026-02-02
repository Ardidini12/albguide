import { pool } from '../config/db.js';

export async function findSiteContentByKey(key) {
  const result = await pool.query('select key, value, updated_at from public.site_content where key=$1', [key]);
  return result.rows[0] || null;
}

export async function upsertSiteContentByKey(key, value, { requestUser } = {}) {
  const client = await pool.connect();
  try {
    await client.query('begin');

    if (String(process.env.ENABLE_RLS || '').toLowerCase() === 'true') {
      const isAdmin = Boolean(requestUser?.is_admin);
      await client.query("select set_config('request.jwt.claim.is_admin', $1, true)", [isAdmin ? 'true' : 'false']);
      if (requestUser?.sub) {
        await client.query("select set_config('request.jwt.claim.sub', $1, true)", [String(requestUser.sub)]);
      }
    }

    const result = await client.query(
      `insert into public.site_content (key, value, updated_at)
       values ($1, $2, now())
       on conflict (key) do update set value = excluded.value, updated_at = now()
       returning key, value, updated_at`,
      [key, value]
    );

    await client.query('commit');
    return result.rows[0] || null;
  } catch (err) {
    try {
      await client.query('rollback');
    } catch {
    }
    throw err;
  } finally {
    client.release();
  }
}
