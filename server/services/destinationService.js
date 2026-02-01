import {
  createDestination,
  deleteDestinationById,
  findDestinationById,
  findDestinationBySlug,
  listDestinations,
  updateDestinationById,
} from '../models/destinationModel.js';
import { slugify } from '../utils/slug.js';

export async function listDestinationsPublic({ region } = {}) {
  return await listDestinations({ includeInactive: false, region });
}

export async function listDestinationsAdmin({ region } = {}) {
  return await listDestinations({ includeInactive: true, region });
}

export async function getDestinationById(id) {
  return await findDestinationById(id);
}

export async function getDestinationBySlug(slug) {
  return await findDestinationBySlug(slug);
}

export async function createDestinationAdmin(payload) {
  const name = payload?.name;
  if (!name) {
    const err = new Error('name is required');
    err.statusCode = 400;
    throw err;
  }

  const baseSlug = payload?.slug ? slugify(payload.slug) : slugify(name);
  if (!baseSlug) {
    const err = new Error('slug is required');
    err.statusCode = 400;
    throw err;
  }

  return await createDestination({
    name,
    slug: baseSlug,
    region: payload?.region,
    description: payload?.description,
    mediaUrls: payload?.media_urls,
    bestTime: payload?.best_time,
    highlights: payload?.highlights,
    activities: payload?.activities,
    isFeatured: payload?.is_featured,
    isActive: payload?.is_active,
  });
}

export async function updateDestinationAdmin(id, payload) {
  const nextSlug = payload?.slug !== undefined ? slugify(payload.slug) : undefined;

  return await updateDestinationById(id, {
    name: payload?.name,
    slug: nextSlug,
    region: payload?.region,
    description: payload?.description,
    mediaUrls: payload?.media_urls,
    bestTime: payload?.best_time,
    highlights: payload?.highlights,
    activities: payload?.activities,
    isFeatured: payload?.is_featured,
    isActive: payload?.is_active,
  });
}

export async function deleteDestinationAdmin(id) {
  return await deleteDestinationById(id);
}
