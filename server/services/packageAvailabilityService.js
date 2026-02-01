import {
  deleteAvailabilityById,
  listAvailability,
  updateAvailabilityById,
  upsertAvailability,
} from '../models/packageAvailabilityModel.js';
import { findPackageById } from '../models/packageModel.js';

export async function listAvailabilityPublic({ packageId } = {}) {
  const pkg = await findPackageById(packageId);
  if (!pkg || !pkg.is_active || !pkg.destination_is_active) {
    const err = new Error('Package not found');
    err.statusCode = 404;
    throw err;
  }

  return await listAvailability({ packageId, includeClosed: false });
}

export async function listAvailabilityAdmin({ packageId } = {}) {
  return await listAvailability({ packageId, includeClosed: true });
}

export async function upsertAvailabilityAdmin({ packageId, date, capacity, remaining, isOpen }) {
  if (!packageId) {
    const err = new Error('package_id is required');
    err.statusCode = 400;
    throw err;
  }

  if (!date) {
    const err = new Error('available_date is required');
    err.statusCode = 400;
    throw err;
  }

  const cap = Number(capacity);
  const rem = remaining === undefined ? cap : Number(remaining);

  if (!Number.isFinite(cap) || cap < 0) {
    const err = new Error('capacity must be a non-negative number');
    err.statusCode = 400;
    throw err;
  }

  if (!Number.isFinite(rem) || rem < 0 || rem > cap) {
    const err = new Error('remaining must be between 0 and capacity');
    err.statusCode = 400;
    throw err;
  }

  return await upsertAvailability({ packageId, date, capacity: cap, remaining: rem, isOpen: Boolean(isOpen) });
}

export async function updateAvailabilityAdmin(id, payload) {
  const cap = payload?.capacity !== undefined ? Number(payload.capacity) : undefined;
  const rem = payload?.remaining !== undefined ? Number(payload.remaining) : undefined;

  return await updateAvailabilityById(id, {
    capacity: cap,
    remaining: rem,
    isOpen: payload?.is_open,
  });
}

export async function deleteAvailabilityAdmin(id) {
  return await deleteAvailabilityById(id);
}
