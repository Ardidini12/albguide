import { pool } from '../config/db.js';

export async function createDestination({
  name,
  slug,
  region,
  description,
  mediaUrls,
  bestTime,
  highlights,
  activities,
  isFeatured,
  isActive,
}) {
  const result = await pool.query(
    `insert into public.destinations (
      name,
      slug,
      region,
      description,
      media_urls,
      best_time,
      highlights,
      activities,
      is_featured,
      is_active
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    returning *`,
    [
      name,
      slug,
      region,
      description,
      Array.isArray(mediaUrls) ? mediaUrls : [],
      bestTime || null,
      Array.isArray(highlights) ? highlights : [],
      Array.isArray(activities) ? activities : [],
      Boolean(isFeatured),
      isActive === undefined ? true : Boolean(isActive),
    ]
  );

  return result.rows[0];
}

export async function listDestinations({ includeInactive = false, region } = {}) {
  const where = [];
  const values = [];
  let i = 1;

  if (!includeInactive) {
    where.push(`is_active=true`);
  }

  if (region) {
    where.push(`region=$${i++}`);
    values.push(region);
  }

  const sql = `
    select *
    from public.destinations
    ${where.length ? `where ${where.join(' and ')}` : ''}
    order by is_featured desc, created_at desc
  `;

  const result = await pool.query(sql, values);
  return result.rows;
}

export async function findDestinationById(id) {
  const result = await pool.query('select * from public.destinations where id=$1', [id]);
  return result.rows[0] || null;
}

export async function findDestinationBySlug(slug) {
  const result = await pool.query('select * from public.destinations where slug=$1', [slug]);
  return result.rows[0] || null;
}

export async function updateDestinationById(
  id,
  {
    name,
    slug,
    region,
    description,
    mediaUrls,
    bestTime,
    highlights,
    activities,
    isFeatured,
    isActive,
  }
) {
  const fields = [];
  const values = [];
  let i = 1;

  if (name !== undefined) {
    fields.push(`name=$${i++}`);
    values.push(name);
  }

  if (slug !== undefined) {
    fields.push(`slug=$${i++}`);
    values.push(slug);
  }

  if (region !== undefined) {
    fields.push(`region=$${i++}`);
    values.push(region);
  }

  if (description !== undefined) {
    fields.push(`description=$${i++}`);
    values.push(description);
  }

  if (mediaUrls !== undefined) {
    fields.push(`media_urls=$${i++}`);
    values.push(Array.isArray(mediaUrls) ? mediaUrls : []);
  }

  if (bestTime !== undefined) {
    fields.push(`best_time=$${i++}`);
    values.push(bestTime || null);
  }

  if (highlights !== undefined) {
    fields.push(`highlights=$${i++}`);
    values.push(Array.isArray(highlights) ? highlights : []);
  }

  if (activities !== undefined) {
    fields.push(`activities=$${i++}`);
    values.push(Array.isArray(activities) ? activities : []);
  }

  if (isFeatured !== undefined) {
    fields.push(`is_featured=$${i++}`);
    values.push(Boolean(isFeatured));
  }

  if (isActive !== undefined) {
    fields.push(`is_active=$${i++}`);
    values.push(Boolean(isActive));
  }

  if (!fields.length) {
    return await findDestinationById(id);
  }

  fields.push(`updated_at=now()`);

  values.push(id);

  const result = await pool.query(
    `update public.destinations set ${fields.join(', ')} where id=$${i} returning *`,
    values
  );

  return result.rows[0] || null;
}

export async function deleteDestinationById(id) {
  const result = await pool.query('delete from public.destinations where id=$1 returning id', [id]);
  return result.rows[0]?.id || null;
}
