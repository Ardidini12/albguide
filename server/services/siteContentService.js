import { findSiteContentByKey, upsertSiteContentByKey } from '../models/siteContentModel.js';

const SERVICES_SUPPORT_KEY = 'services_support';

export async function getServicesSupportContent() {
  const row = await findSiteContentByKey(SERVICES_SUPPORT_KEY);
  return row?.value || null;
}

export async function updateServicesSupportContent(nextValue, { requestUser } = {}) {
  if (!nextValue || typeof nextValue !== 'object' || Array.isArray(nextValue)) {
    const err = new Error('Invalid content payload');
    err.statusCode = 400;
    throw err;
  }

  const row = await upsertSiteContentByKey(SERVICES_SUPPORT_KEY, nextValue, { requestUser });
  return row?.value || null;
}
