import {
  deleteAvailabilityAdmin,
  listAvailabilityAdmin,
  listAvailabilityPublic,
  updateAvailabilityAdmin,
  upsertAvailabilityAdmin,
} from '../services/packageAvailabilityService.js';

export async function listPublic(req, res) {
  try {
    const rows = await listAvailabilityPublic({ packageId: req.params.packageId });
    return res.json({ availability: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function listAdmin(req, res) {
  try {
    const rows = await listAvailabilityAdmin({ packageId: req.params.packageId });
    return res.json({ availability: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function upsertAdmin(req, res) {
  try {
    const row = await upsertAvailabilityAdmin({
      packageId: req.params.packageId,
      date: req.body?.available_date,
      capacity: req.body?.capacity,
      remaining: req.body?.remaining,
      isOpen: req.body?.is_open,
    });
    return res.status(201).json({ availability: row });
  } catch (err) {
    if (err?.statusCode) {
      return res.status(err.statusCode).json({ message: err.message || 'Bad request' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateAdmin(req, res) {
  try {
    const row = await updateAvailabilityAdmin(req.params.id, req.body || {});
    if (!row) return res.status(404).json({ message: 'Availability not found' });
    return res.json({ availability: row });
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
    const deletedId = await deleteAvailabilityAdmin(req.params.id);
    if (!deletedId) return res.status(404).json({ message: 'Availability not found' });
    return res.json({ deletedId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
