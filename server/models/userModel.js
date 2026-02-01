import { pool } from '../config/db.js';

export async function createUser({ email, passwordHash, name, isAdmin }) {
  const created = await pool.query(
    'insert into public.users (email, password_hash, name, is_admin) values ($1, $2, $3, $4) returning id, email, name, is_admin, created_at',
    [String(email).toLowerCase(), passwordHash, name || null, Boolean(isAdmin)]
  );
  return created.rows[0];
}

export async function findUserByEmailWithPassword(email) {
  const result = await pool.query(
    'select id, email, password_hash, name, is_admin, created_at from public.users where email=$1',
    [String(email).toLowerCase()]
  );
  return result.rows[0] || null;
}

export async function findUserById(id) {
  const result = await pool.query(
    'select id, email, name, is_admin, created_at from public.users where id=$1',
    [id]
  );
  return result.rows[0] || null;
}

export async function listUsers() {
  const result = await pool.query(
    'select id, email, name, is_admin, created_at from public.users order by created_at desc'
  );
  return result.rows;
}

export async function deleteUserById(id) {
  const result = await pool.query('delete from public.users where id=$1 returning id', [id]);
  return result.rows[0]?.id || null;
}

export async function updateUserById(id, { email, name, passwordHash, isAdmin }) {
  const fields = [];
  const values = [];
  let i = 1;

  if (email !== undefined) {
    fields.push(`email=$${i++}`);
    values.push(String(email).toLowerCase());
  }

  if (name !== undefined) {
    fields.push(`name=$${i++}`);
    values.push(name || null);
  }

  if (passwordHash !== undefined) {
    fields.push(`password_hash=$${i++}`);
    values.push(passwordHash);
  }

  if (isAdmin !== undefined) {
    fields.push(`is_admin=$${i++}`);
    values.push(Boolean(isAdmin));
  }

  if (fields.length === 0) {
    return await findUserById(id);
  }

  values.push(id);

  const result = await pool.query(
    `update public.users set ${fields.join(', ')} where id=$${i} returning id, email, name, is_admin, created_at`,
    values
  );

  return result.rows[0] || null;
}

export async function ensureAdminByEmail(email) {
  const result = await pool.query(
    'update public.users set is_admin=true where email=$1 returning id, email, name, is_admin, created_at',
    [String(email).toLowerCase()]
  );
  return result.rows[0] || null;
}
