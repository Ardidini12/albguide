import {
  createDestinationAdmin,
  deleteDestinationAdmin,
  getDestinationById,
  getDestinationBySlug,
  listDestinationsAdmin,
  listDestinationsPublic,
  updateDestinationAdmin,
} from '../services/destinationService.js';
import { createSignedReadUrl, isLikelyExternalUrl } from '../services/storageService.js';

async function decorateDestination(row) {
  if (!row) return row;

  const raw = Array.isArray(row.media_urls) ? row.media_urls.filter(Boolean) : [];
  const signed = [];

  for (const item of raw) {
    if (isLikelyExternalUrl(item)) {
      signed.push(item);
      continue;
    }

    signed.push(await createSignedReadUrl(item, 3600));
  }

  const primaryRaw = raw[0] || null;
  const primarySigned = signed[0] || null;

  return {
    ...row,
    media_paths: raw,
    media_urls: signed,
    image_path: primaryRaw && !isLikelyExternalUrl(primaryRaw) ? primaryRaw : null,
    image_url: primarySigned,
  };
}

export async function listPublic(req, res) {
  try {
    const region = req.query.region ? String(req.query.region) : undefined;
    const destinations = await listDestinationsPublic({ region });
    const decorated = await Promise.all(destinations.map((d) => decorateDestination(d)));
    return res.json({ destinations: decorated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getById(req, res) {
  try {
    const destination = await getDestinationById(req.params.id);
    if (!destination || !destination.is_active) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    return res.json({ destination: await decorateDestination(destination) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getBySlug(req, res) {
  try {
    const destination = await getDestinationBySlug(req.params.slug);
    if (!destination || !destination.is_active) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    return res.json({ destination: await decorateDestination(destination) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function listAdmin(req, res) {
  try {
    const region = req.query.region ? String(req.query.region) : undefined;
    const destinations = await listDestinationsAdmin({ region });
    const decorated = await Promise.all(destinations.map((d) => decorateDestination(d)));
    return res.json({ destinations: decorated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function createAdmin(req, res) {
  try {
    const destination = await createDestinationAdmin(req.body || {});
    return res.status(201).json({ destination: await decorateDestination(destination) });
  } catch (err) {
    if (String(err?.code) === '23505') {
      return res.status(409).json({ message: 'Destination slug already exists' });
    }
    if (err?.statusCode) {
      return res.status(err.statusCode).json({ message: err.message || 'Bad request' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateAdmin(req, res) {
  try {
    const destination = await updateDestinationAdmin(req.params.id, req.body || {});
    if (!destination) return res.status(404).json({ message: 'Destination not found' });
    return res.json({ destination: await decorateDestination(destination) });
  } catch (err) {
    if (String(err?.code) === '23505') {
      return res.status(409).json({ message: 'Destination slug already exists' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function removeAdmin(req, res) {
  try {
    const deletedId = await deleteDestinationAdmin(req.params.id);
    if (!deletedId) return res.status(404).json({ message: 'Destination not found' });
    return res.json({ deletedId });
  } catch (err) {
    if (String(err?.code) === '23503') {
      return res.status(409).json({ message: 'Cannot delete destination while it has packages. Delete/move packages first.' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
