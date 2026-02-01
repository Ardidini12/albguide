import { pool } from '../config/db.js';

export async function createBooking({
  packageId,
  userId,
  bookingDate,
  guestFullName,
  whatsappNumber,
  adults,
  children,
  infants,
  travelerCount,
  note,
  status,
}) {
  const result = await pool.query(
    `insert into public.bookings (
      package_id,
      user_id,
      booking_date,
      guest_full_name,
      whatsapp_number,
      adults,
      children,
      infants,
      traveler_count,
      note,
      status
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    returning *`,
    [
      packageId,
      userId || null,
      bookingDate,
      guestFullName,
      whatsappNumber,
      adults,
      children,
      infants,
      travelerCount,
      note || null,
      status || 'pending_contact',
    ]
  );

  return result.rows[0];
}

export async function findBookingById(id) {
  const result = await pool.query('select * from public.bookings where id=$1', [id]);
  return result.rows[0] || null;
}

export async function listBookings({ userId } = {}) {
  const where = [];
  const values = [];
  let i = 1;

  if (userId) {
    where.push(`user_id=$${i++}`);
    values.push(userId);
  }

  const sql = `
    select *
    from public.bookings
    ${where.length ? `where ${where.join(' and ')}` : ''}
    order by created_at desc
  `;

  const result = await pool.query(sql, values);
  return result.rows;
}

export async function updateBookingById(id, { status }) {
  const fields = [];
  const values = [];
  let i = 1;

  if (status !== undefined) {
    fields.push(`status=$${i++}`);
    values.push(status);
  }

  if (!fields.length) {
    return await findBookingById(id);
  }

  fields.push('updated_at=now()');
  values.push(id);

  const result = await pool.query(
    `update public.bookings set ${fields.join(', ')} where id=$${i} returning *`,
    values
  );

  return result.rows[0] || null;
}
