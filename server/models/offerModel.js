import { pool } from '../config/db.js';

export async function createOffer({ title, description, discountPercentage, code, validFrom, validTo, isActive }) {
  const result = await pool.query(
    `insert into public.offers 
    (title, description, discount_percentage, code, valid_from, valid_to, is_active) 
    values ($1, $2, $3, $4, $5, $6, $7) 
    returning *`,
    [title, description, discountPercentage, code || null, validFrom || null, validTo || null, isActive !== undefined ? isActive : true]
  );
  return result.rows[0];
}

export async function listActiveOffers() {
  const result = await pool.query(
    `select * from public.offers 
    where is_active = true 
    and (valid_from is null or valid_from <= now()) 
    and (valid_to is null or valid_to >= now()) 
    order by created_at desc`
  );
  return result.rows;
}

export async function listAllOffers() {
  const result = await pool.query('select * from public.offers order by created_at desc');
  return result.rows;
}

export async function getOfferById(id) {
  const result = await pool.query('select * from public.offers where id=$1', [id]);
  return result.rows[0] || null;
}

export async function updateOffer(id, { title, description, discountPercentage, code, validFrom, validTo, isActive }) {
  const fields = [];
  const values = [];
  let i = 1;

  if (title !== undefined) { fields.push(`title=$${i++}`); values.push(title); }
  if (description !== undefined) { fields.push(`description=$${i++}`); values.push(description); }
  if (discountPercentage !== undefined) { fields.push(`discount_percentage=$${i++}`); values.push(discountPercentage); }
  if (code !== undefined) { fields.push(`code=$${i++}`); values.push(code || null); }
  if (validFrom !== undefined) { fields.push(`valid_from=$${i++}`); values.push(validFrom || null); }
  if (validTo !== undefined) { fields.push(`valid_to=$${i++}`); values.push(validTo || null); }
  if (isActive !== undefined) { fields.push(`is_active=$${i++}`); values.push(isActive); }

  if (fields.length === 0) return await getOfferById(id);

  values.push(id);
  const result = await pool.query(
    `update public.offers set ${fields.join(', ')}, updated_at=now() where id=$${i} returning *`,
    values
  );
  return result.rows[0];
}

export async function deleteOffer(id) {
  const result = await pool.query('delete from public.offers where id=$1 returning id', [id]);
  return result.rows[0]?.id || null;
}
