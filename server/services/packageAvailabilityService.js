import {
  getAvailability,
  upsertAvailability,
  deleteAvailability,
  isDateAvailable,
} from '../models/packageAvailabilityModel.js';
import { findPackageById } from '../models/packageModel.js';

export async function getAvailabilityPublic(packageId) {
  const pkg = await findPackageById(packageId);
  if (!pkg || !pkg.is_active || !pkg.destination_is_active) {
    const err = new Error('Package not found');
    err.statusCode = 404;
    throw err;
  }

  const availability = await getAvailability(packageId);
  return availability && availability.is_open ? availability : null;
}

export async function getAvailabilityAdmin(packageId) {
  return await getAvailability(packageId);
}

export async function checkDateAvailability(packageId, date) {
  const availability = await getAvailability(packageId);
  return isDateAvailable(availability, date);
}

export async function upsertAvailabilityAdmin({ packageId, availabilityType, startDate, endDate, excludedWeekdays, specificDates, isOpen }) {
  if (!packageId) {
    const err = new Error('package_id is required');
    err.statusCode = 400;
    throw err;
  }

  if (!availabilityType) {
    const err = new Error('availability_type is required');
    err.statusCode = 400;
    throw err;
  }

  const validTypes = ['always', 'date_range', 'specific_dates', 'always_except'];
  if (!validTypes.includes(availabilityType)) {
    const err = new Error('Invalid availability_type');
    err.statusCode = 400;
    throw err;
  }

  if (availabilityType === 'date_range') {
    if (!startDate || !endDate) {
      const err = new Error('start_date and end_date are required for date_range type');
      err.statusCode = 400;
      throw err;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      const err = new Error('Invalid date format for start_date or end_date');
      err.statusCode = 400;
      throw err;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      const err = new Error('start_date cannot be in the past');
      err.statusCode = 400;
      throw err;
    }
    if (end < start) {
      const err = new Error('end_date must be after start_date');
      err.statusCode = 400;
      throw err;
    }
  }

  if (availabilityType === 'specific_dates') {
    if (!specificDates || specificDates.length === 0) {
      const err = new Error('specific_dates array is required for specific_dates type');
      err.statusCode = 400;
      throw err;
    }
    for (const dateStr of specificDates) {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        const err = new Error(`Invalid date in specific_dates: ${dateStr}`);
        err.statusCode = 400;
        throw err;
      }
    }
  }

  if (excludedWeekdays && Array.isArray(excludedWeekdays)) {
    for (const day of excludedWeekdays) {
      if (!Number.isInteger(day) || day < 0 || day > 6) {
        const err = new Error('excludedWeekdays must contain integers 0-6');
        err.statusCode = 400;
        throw err;
      }
    }
  }

  return await upsertAvailability({
    packageId,
    availabilityType,
    startDate: startDate || null,
    endDate: endDate || null,
    excludedWeekdays: excludedWeekdays || [],
    specificDates: specificDates || [],
    isOpen: Boolean(isOpen)
  });
}

export async function deleteAvailabilityAdmin(packageId) {
  return await deleteAvailability(packageId);
}
