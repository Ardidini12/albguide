import { pool } from '../config/db.js';
import { createBooking, listBookings, updateBookingById } from '../models/bookingModel.js';
import { findPackageById } from '../models/packageModel.js';

function isValidE164(value) {
  return typeof value === 'string' && /^\+[1-9]\d{7,14}$/.test(value);
}

export async function createBookingAnyUser({
  packageId,
  bookingDate,
  fullName,
  whatsappNumber,
  adults,
  children,
  infants,
  note,
  userId,
  idempotencyKey,
}) {
  if (!packageId) {
    const err = new Error('package_id is required');
    err.statusCode = 400;
    throw err;
  }

  if (!bookingDate) {
    const err = new Error('date is required');
    err.statusCode = 400;
    throw err;
  }

  if (!fullName) {
    const err = new Error('full_name is required');
    err.statusCode = 400;
    throw err;
  }

  if (!isValidE164(whatsappNumber)) {
    const err = new Error('whatsapp_number must be in E.164 format (e.g. +355...)');
    err.statusCode = 400;
    throw err;
  }

  const a = Number(adults ?? 1);
  const c = Number(children ?? 0);
  const i = Number(infants ?? 0);

  if (![a, c, i].every((n) => Number.isFinite(n) && n >= 0)) {
    const err = new Error('travelers counts must be non-negative numbers');
    err.statusCode = 400;
    throw err;
  }

  const travelerCount = a + c + i;
  if (travelerCount <= 0) {
    const err = new Error('traveler_count must be greater than 0');
    err.statusCode = 400;
    throw err;
  }

  const pkg = await findPackageById(packageId);
  if (!pkg || !pkg.is_active || !pkg.destination_is_active) {
    const err = new Error('Package not found');
    err.statusCode = 404;
    throw err;
  }

  const client = await pool.connect();

  try {
    await client.query('begin');

    if (idempotencyKey) {
      const existing = await client.query(
        'select * from public.bookings where idempotency_key=$1 limit 1',
        [idempotencyKey]
      );

      if (existing.rows[0]) {
        await client.query('commit');
        return existing.rows[0];
      }
    }

    const availability = await client.query(
      `select *
       from public.package_availability
       where package_id=$1
         and available_date=$2
         and is_open=true
       for update`,
      [packageId, bookingDate]
    );

    const row = availability.rows[0];
    if (!row) {
      const err = new Error('Selected date is not available');
      err.statusCode = 400;
      throw err;
    }

    if (row.remaining < travelerCount) {
      const err = new Error('Not enough spots remaining for this date');
      err.statusCode = 409;
      throw err;
    }

    await client.query(
      'update public.package_availability set remaining = remaining - $1, updated_at=now() where id=$2',
      [travelerCount, row.id]
    );

    try {
      const booking = await client.query(
      `insert into public.bookings (
        package_id,
        user_id,
        idempotency_key,
        booking_date,
        guest_full_name,
        whatsapp_number,
        adults,
        children,
        infants,
        traveler_count,
        note,
        status
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      returning *`,
      [
        packageId,
        userId || null,
        idempotencyKey || null,
        bookingDate,
        fullName,
        whatsappNumber,
        a,
        c,
        i,
        travelerCount,
        note || null,
        'pending_contact',
      ]
      );

      await client.query('commit');
      return booking.rows[0];
    } catch (err) {
      if (String(err?.code) === '23505' && idempotencyKey) {
        const existing = await client.query(
          'select * from public.bookings where idempotency_key=$1 limit 1',
          [idempotencyKey]
        );
        if (existing.rows[0]) {
          await client.query('commit');
          return existing.rows[0];
        }
      }
      throw err;
    }
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

export async function listMyBookings(userId) {
  return await listBookings({ userId });
}

export async function listBookingsAdmin() {
  return await listBookings({});
}

export async function updateBookingStatusAdmin(id, status) {
  if (!status) {
    const err = new Error('status is required');
    err.statusCode = 400;
    throw err;
  }

  return await updateBookingById(id, { status });
}
