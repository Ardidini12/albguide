import {
  getAvailabilityPublic,
  getAvailabilityAdmin,
  upsertAvailabilityAdmin,
  deleteAvailabilityAdmin,
  checkDateAvailability,
} from '../services/packageAvailabilityService.js';

export async function getPublic(req, res) {
  try {
    const availability = await getAvailabilityPublic(req.params.packageId);
    return res.json({ availability });
  } catch (err) {
    if (err?.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getAdmin(req, res) {
  try {
    const availability = await getAvailabilityAdmin(req.params.packageId);
    return res.json({ availability });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function checkDate(req, res) {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'date query parameter is required' });
    }
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    const isAvailable = await checkDateAvailability(req.params.packageId, date);
    return res.json({ available: isAvailable });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function upsertAdmin(req, res) {
  try {
    const availability = await upsertAvailabilityAdmin({
      packageId: req.params.packageId,
      availabilityType: req.body?.availability_type,
      startDate: req.body?.start_date,
      endDate: req.body?.end_date,
      excludedWeekdays: req.body?.excluded_weekdays,
      specificDates: req.body?.specific_dates,
      isOpen: req.body?.is_open,
    });
    return res.status(201).json({ availability });
  } catch (err) {
    if (err?.statusCode) {
      return res.status(err.statusCode).json({ message: err.message || 'Bad request' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function removeAdmin(req, res) {
  try {
    const deletedId = await deleteAvailabilityAdmin(req.params.packageId);
    if (!deletedId) return res.status(404).json({ message: 'Availability not found' });
    return res.json({ deletedId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
