import { createBookingAnyUser, listBookingsAdmin, listMyBookings, updateBookingStatusAdmin } from '../services/bookingService.js';

export async function create(req, res) {
  try {
    const idempotencyKey = req.headers['idempotency-key'] ? String(req.headers['idempotency-key']) : null;

    const booking = await createBookingAnyUser({
      packageId: req.body?.package_id,
      bookingDate: req.body?.date,
      fullName: req.body?.full_name,
      whatsappNumber: req.body?.whatsapp_number,
      adults: req.body?.adults,
      children: req.body?.children,
      infants: req.body?.infants,
      note: req.body?.note,
      userId: req.user?.sub || null,
      idempotencyKey,
    });

    return res.status(201).json({ booking });
  } catch (err) {
    if (err?.statusCode) {
      return res.status(err.statusCode).json({ message: err.message || 'Bad request' });
    }
    if (String(err?.code) === '23514') {
      return res.status(400).json({ message: 'Invalid booking data' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function listMe(req, res) {
  try {
    const bookings = await listMyBookings(req.user.sub);
    return res.json({ bookings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function listAdmin(req, res) {
  try {
    const bookings = await listBookingsAdmin();
    return res.json({ bookings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateStatusAdmin(req, res) {
  try {
    const booking = await updateBookingStatusAdmin(req.params.id, req.body?.status);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    return res.json({ booking });
  } catch (err) {
    if (err?.statusCode) {
      return res.status(err.statusCode).json({ message: err.message || 'Bad request' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
