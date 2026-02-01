import {
  createPackageAdmin,
  deletePackageAdmin,
  getPackageById,
  getPackageBySlug,
  listPackagesAdmin,
  listPackagesPublic,
  updatePackageAdmin,
} from '../services/packageService.js';
import { createSignedReadUrl, isLikelyExternalUrl } from '../services/storageService.js';

async function decoratePackage(row) {
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

  return {
    ...row,
    media_paths: raw,
    media_urls: signed,
  };
}

export async function listPublic(req, res) {
  try {
    const destinationId = req.query.destination_id ? String(req.query.destination_id) : undefined;
    const rows = await listPackagesPublic({ destinationId });
    const decorated = await Promise.all(rows.map((p) => decoratePackage(p)));
    return res.json({ packages: decorated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getById(req, res) {
  try {
    const pkg = await getPackageById(req.params.id);
    if (!pkg || !pkg.is_active || !pkg.destination_is_active) {
      return res.status(404).json({ message: 'Package not found' });
    }
    return res.json({ package: await decoratePackage(pkg) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getBySlug(req, res) {
  try {
    const pkg = await getPackageBySlug(req.params.slug);
    if (!pkg || !pkg.is_active || !pkg.destination_is_active) {
      return res.status(404).json({ message: 'Package not found' });
    }
    return res.json({ package: await decoratePackage(pkg) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function listAdmin(req, res) {
  try {
    const destinationId = req.query.destination_id ? String(req.query.destination_id) : undefined;
    const rows = await listPackagesAdmin({ destinationId });
    const decorated = await Promise.all(rows.map((p) => decoratePackage(p)));
    return res.json({ packages: decorated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function createAdmin(req, res) {
  try {
    const pkg = await createPackageAdmin(req.body || {});
    return res.status(201).json({ package: await decoratePackage(pkg) });
  } catch (err) {
    if (String(err?.code) === '23505') {
      return res.status(409).json({ message: 'Package slug already exists' });
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
    const pkg = await updatePackageAdmin(req.params.id, req.body || {});
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    return res.json({ package: await decoratePackage(pkg) });
  } catch (err) {
    if (String(err?.code) === '23505') {
      return res.status(409).json({ message: 'Package slug already exists' });
    }
    if (err?.statusCode) {
      return res.status(err.statusCode).json({ message: err.message || 'Bad request' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function removeAdmin(req, res) {
  try {
    const deletedId = await deletePackageAdmin(req.params.id);
    if (!deletedId) return res.status(404).json({ message: 'Package not found' });
    return res.json({ deletedId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
