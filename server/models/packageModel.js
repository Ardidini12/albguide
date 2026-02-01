import { pool } from '../config/db.js';

export async function createPackage({
  destinationId,
  name,
  slug,
  about,
  description,
  whatYoullSee,
  itinerary,
  whatsIncluded,
  whatsNotIncluded,
  whatToExpect,
  meetingAndPickup,
  accessibility,
  additionalInformation,
  cancellationPolicy,
  help,
  durationMinutes,
  priceCents,
  currency,
  languages,
  groupSizeMax,
  minAge,
  locationName,
  meetingPointName,
  meetingPointAddress,
  meetingPointLat,
  meetingPointLng,
  mediaUrls,
  isActive,
}) {
  const result = await pool.query(
    `insert into public.packages (
      destination_id,
      name,
      slug,
      about,
      description,
      what_youll_see,
      itinerary,
      whats_included,
      whats_not_included,
      what_to_expect,
      meeting_and_pickup,
      accessibility,
      additional_information,
      cancellation_policy,
      help,
      duration_minutes,
      price_cents,
      currency,
      languages,
      group_size_max,
      min_age,
      location_name,
      meeting_point_name,
      meeting_point_address,
      meeting_point_lat,
      meeting_point_lng,
      media_urls,
      is_active
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27)
    returning *`,
    [
      destinationId,
      name,
      slug,
      about || null,
      description || null,
      whatYoullSee || null,
      itinerary || null,
      whatsIncluded || null,
      whatsNotIncluded || null,
      whatToExpect || null,
      meetingAndPickup || null,
      accessibility || null,
      additionalInformation || null,
      cancellationPolicy || null,
      help || null,
      Number.isFinite(durationMinutes) ? durationMinutes : null,
      Number.isFinite(priceCents) ? priceCents : null,
      currency || 'EUR',
      Array.isArray(languages) ? languages : [],
      Number.isFinite(groupSizeMax) ? groupSizeMax : null,
      Number.isFinite(minAge) ? minAge : null,
      locationName || null,
      meetingPointName || null,
      meetingPointAddress || null,
      Number.isFinite(meetingPointLat) ? meetingPointLat : null,
      Number.isFinite(meetingPointLng) ? meetingPointLng : null,
      Array.isArray(mediaUrls) ? mediaUrls : [],
      Boolean(isActive),
    ]
  );

  return result.rows[0];
}

export async function listPackages({ includeInactive = false, destinationId } = {}) {
  const where = [];
  const values = [];
  let i = 1;

  if (!includeInactive) {
    where.push('p.is_active=true');
    where.push('d.is_active=true');
  }

  if (destinationId) {
    where.push(`p.destination_id=$${i++}`);
    values.push(destinationId);
  }

  const sql = `
    select p.*,
           d.name as destination_name,
           d.slug as destination_slug,
           d.region as destination_region,
           d.is_active as destination_is_active
    from public.packages p
    join public.destinations d on d.id = p.destination_id
    ${where.length ? `where ${where.join(' and ')}` : ''}
    order by p.created_at desc
  `;

  const result = await pool.query(sql, values);
  return result.rows;
}

export async function findPackageById(id) {
  const result = await pool.query(
    `select p.*,
            d.name as destination_name,
            d.slug as destination_slug,
            d.region as destination_region,
            d.is_active as destination_is_active
     from public.packages p
     join public.destinations d on d.id = p.destination_id
     where p.id=$1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function findPackageBySlug(slug) {
  const result = await pool.query(
    `select p.*,
            d.name as destination_name,
            d.slug as destination_slug,
            d.region as destination_region,
            d.is_active as destination_is_active
     from public.packages p
     join public.destinations d on d.id = p.destination_id
     where p.slug=$1`,
    [slug]
  );
  return result.rows[0] || null;
}

export async function updatePackageById(
  id,
  {
    destinationId,
    name,
    slug,
    about,
    description,
    whatYoullSee,
    itinerary,
    whatsIncluded,
    whatsNotIncluded,
    whatToExpect,
    meetingAndPickup,
    accessibility,
    additionalInformation,
    cancellationPolicy,
    help,
    durationMinutes,
    priceCents,
    currency,
    languages,
    groupSizeMax,
    minAge,
    locationName,
    meetingPointName,
    meetingPointAddress,
    meetingPointLat,
    meetingPointLng,
    mediaUrls,
    isActive,
  }
) {
  const fields = [];
  const values = [];
  let i = 1;

  if (destinationId !== undefined) {
    fields.push(`destination_id=$${i++}`);
    values.push(destinationId);
  }
  if (name !== undefined) {
    fields.push(`name=$${i++}`);
    values.push(name);
  }
  if (slug !== undefined) {
    fields.push(`slug=$${i++}`);
    values.push(slug);
  }
  if (about !== undefined) {
    fields.push(`about=$${i++}`);
    values.push(about || null);
  }
  if (description !== undefined) {
    fields.push(`description=$${i++}`);
    values.push(description || null);
  }
  if (whatYoullSee !== undefined) {
    fields.push(`what_youll_see=$${i++}`);
    values.push(whatYoullSee || null);
  }
  if (itinerary !== undefined) {
    fields.push(`itinerary=$${i++}`);
    values.push(itinerary || null);
  }
  if (whatsIncluded !== undefined) {
    fields.push(`whats_included=$${i++}`);
    values.push(whatsIncluded || null);
  }
  if (whatsNotIncluded !== undefined) {
    fields.push(`whats_not_included=$${i++}`);
    values.push(whatsNotIncluded || null);
  }
  if (whatToExpect !== undefined) {
    fields.push(`what_to_expect=$${i++}`);
    values.push(whatToExpect || null);
  }
  if (meetingAndPickup !== undefined) {
    fields.push(`meeting_and_pickup=$${i++}`);
    values.push(meetingAndPickup || null);
  }
  if (accessibility !== undefined) {
    fields.push(`accessibility=$${i++}`);
    values.push(accessibility || null);
  }
  if (additionalInformation !== undefined) {
    fields.push(`additional_information=$${i++}`);
    values.push(additionalInformation || null);
  }
  if (cancellationPolicy !== undefined) {
    fields.push(`cancellation_policy=$${i++}`);
    values.push(cancellationPolicy || null);
  }
  if (help !== undefined) {
    fields.push(`help=$${i++}`);
    values.push(help || null);
  }
  if (durationMinutes !== undefined) {
    fields.push(`duration_minutes=$${i++}`);
    values.push(Number.isFinite(durationMinutes) ? durationMinutes : null);
  }
  if (priceCents !== undefined) {
    fields.push(`price_cents=$${i++}`);
    values.push(Number.isFinite(priceCents) ? priceCents : null);
  }
  if (currency !== undefined) {
    fields.push(`currency=$${i++}`);
    values.push(currency || 'EUR');
  }
  if (languages !== undefined) {
    fields.push(`languages=$${i++}`);
    values.push(Array.isArray(languages) ? languages : []);
  }
  if (groupSizeMax !== undefined) {
    fields.push(`group_size_max=$${i++}`);
    values.push(Number.isFinite(groupSizeMax) ? groupSizeMax : null);
  }
  if (minAge !== undefined) {
    fields.push(`min_age=$${i++}`);
    values.push(Number.isFinite(minAge) ? minAge : null);
  }
  if (locationName !== undefined) {
    fields.push(`location_name=$${i++}`);
    values.push(locationName || null);
  }
  if (meetingPointName !== undefined) {
    fields.push(`meeting_point_name=$${i++}`);
    values.push(meetingPointName || null);
  }
  if (meetingPointAddress !== undefined) {
    fields.push(`meeting_point_address=$${i++}`);
    values.push(meetingPointAddress || null);
  }
  if (meetingPointLat !== undefined) {
    fields.push(`meeting_point_lat=$${i++}`);
    values.push(Number.isFinite(meetingPointLat) ? meetingPointLat : null);
  }
  if (meetingPointLng !== undefined) {
    fields.push(`meeting_point_lng=$${i++}`);
    values.push(Number.isFinite(meetingPointLng) ? meetingPointLng : null);
  }
  if (mediaUrls !== undefined) {
    fields.push(`media_urls=$${i++}`);
    values.push(Array.isArray(mediaUrls) ? mediaUrls : []);
  }
  if (isActive !== undefined) {
    fields.push(`is_active=$${i++}`);
    values.push(Boolean(isActive));
  }

  if (!fields.length) {
    return await findPackageById(id);
  }

  fields.push('updated_at=now()');
  values.push(id);

  const result = await pool.query(
    `update public.packages set ${fields.join(', ')} where id=$${i} returning *`,
    values
  );

  return result.rows[0] || null;
}

export async function deletePackageById(id) {
  const result = await pool.query('delete from public.packages where id=$1 returning id', [id]);
  return result.rows[0]?.id || null;
}
