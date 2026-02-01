import { pool } from '../config/db.js';

export async function listAvailability({ packageId, includeClosed = false } = {}) {
  const where = [];
  const values = [];
  let i = 1;

  if (packageId) {
    where.push(`package_id=$${i++}`);
    values.push(packageId);
  }

  if (!includeClosed) {
    where.push('is_open=true');
  }

  const sql = `
    select *
    from public.package_availability
    ${where.length ? `where ${where.join(' and ')}` : ''}
    order by available_date asc
  `;

  const result = await pool.query(sql, values);
  return result.rows;
}

export async function upsertAvailability({ packageId, date, capacity, remaining, isOpen }) {
  const result = await pool.query(
    `insert into public.package_availability (
      package_id,
      available_date,
      capacity,
      remaining,
      is_open
    ) values ($1,$2,$3,$4,$5)
    on conflict (package_id, available_date)
    do update set
      capacity=excluded.capacity,
      remaining=excluded.remaining,
      is_open=excluded.is_open,
      updated_at=now()
    returning *`,
    [packageId, date, capacity, remaining, Boolean(isOpen)]
  );

  return result.rows[0];
}

export async function findAvailabilityById(id) {
  const result = await pool.query('select * from public.package_availability where id=$1', [id]);
  return result.rows[0] || null;
}

export async function deleteAvailabilityById(id) {
  const result = await pool.query('delete from public.package_availability where id=$1 returning id', [id]);
  return result.rows[0]?.id || null;
}

export async function updateAvailabilityById(id, { capacity, remaining, isOpen }) {
  const fields = [];
  const values = [];
  let i = 1;

  if (capacity !== undefined) {
    fields.push(`capacity=$${i++}`);
    values.push(capacity);
  }

  if (remaining !== undefined) {
    fields.push(`remaining=$${i++}`);
    values.push(remaining);
  }

  if (isOpen !== undefined) {
    fields.push(`is_open=$${i++}`);
    values.push(Boolean(isOpen));
  }

  if (!fields.length) {
    return await findAvailabilityById(id);
  }

  fields.push('updated_at=now()');
  values.push(id);

  const result = await pool.query(
    `update public.package_availability set ${fields.join(', ')} where id=$${i} returning *`,
    values
  );

  return result.rows[0] || null;
}
