import {
  createPackage,
  deletePackageById,
  findPackageById,
  findPackageBySlug,
  listPackages,
  updatePackageById,
} from '../models/packageModel.js';
import { slugify } from '../utils/slug.js';

export async function listPackagesPublic({ destinationId } = {}) {
  return await listPackages({ includeInactive: false, destinationId });
}

export async function listPackagesAdmin({ destinationId } = {}) {
  return await listPackages({ includeInactive: true, destinationId });
}

export async function getPackageById(id) {
  return await findPackageById(id);
}

export async function getPackageBySlug(slug) {
  return await findPackageBySlug(slug);
}

export async function createPackageAdmin(payload) {
  const name = payload?.name;
  const destinationId = payload?.destination_id;

  if (!name) {
    const err = new Error('name is required');
    err.statusCode = 400;
    throw err;
  }

  if (!destinationId) {
    const err = new Error('destination_id is required');
    err.statusCode = 400;
    throw err;
  }

  const baseSlug = payload?.slug ? slugify(payload.slug) : slugify(name);
  if (!baseSlug) {
    const err = new Error('slug is required');
    err.statusCode = 400;
    throw err;
  }

  return await createPackage({
    destinationId,
    name,
    slug: baseSlug,
    about: payload?.about,
    description: payload?.description,
    whatYoullSee: payload?.what_youll_see,
    itinerary: payload?.itinerary,
    whatsIncluded: payload?.whats_included,
    whatsNotIncluded: payload?.whats_not_included,
    whatToExpect: payload?.what_to_expect,
    meetingAndPickup: payload?.meeting_and_pickup,
    accessibility: payload?.accessibility,
    additionalInformation: payload?.additional_information,
    cancellationPolicy: payload?.cancellation_policy,
    help: payload?.help,
    durationMinutes: payload?.duration_minutes,
    priceCents: payload?.price_cents,
    currency: payload?.currency,
    languages: payload?.languages,
    groupSizeMax: payload?.group_size_max,
    minAge: payload?.min_age,
    locationName: payload?.location_name,
    meetingPointName: payload?.meeting_point_name,
    meetingPointAddress: payload?.meeting_point_address,
    meetingPointLat: payload?.meeting_point_lat,
    meetingPointLng: payload?.meeting_point_lng,
    mediaUrls: payload?.media_urls,
    isActive: payload?.is_active,
  });
}

export async function updatePackageAdmin(id, payload) {
  const nextSlug = payload?.slug !== undefined ? slugify(payload.slug) : undefined;

  return await updatePackageById(id, {
    destinationId: payload?.destination_id,
    name: payload?.name,
    slug: nextSlug,
    about: payload?.about,
    description: payload?.description,
    whatYoullSee: payload?.what_youll_see,
    itinerary: payload?.itinerary,
    whatsIncluded: payload?.whats_included,
    whatsNotIncluded: payload?.whats_not_included,
    whatToExpect: payload?.what_to_expect,
    meetingAndPickup: payload?.meeting_and_pickup,
    accessibility: payload?.accessibility,
    additionalInformation: payload?.additional_information,
    cancellationPolicy: payload?.cancellation_policy,
    help: payload?.help,
    durationMinutes: payload?.duration_minutes,
    priceCents: payload?.price_cents,
    currency: payload?.currency,
    languages: payload?.languages,
    groupSizeMax: payload?.group_size_max,
    minAge: payload?.min_age,
    locationName: payload?.location_name,
    meetingPointName: payload?.meeting_point_name,
    meetingPointAddress: payload?.meeting_point_address,
    meetingPointLat: payload?.meeting_point_lat,
    meetingPointLng: payload?.meeting_point_lng,
    mediaUrls: payload?.media_urls,
    isActive: payload?.is_active,
  });
}

export async function deletePackageAdmin(id) {
  return await deletePackageById(id);
}
