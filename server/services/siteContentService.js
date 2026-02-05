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

// Services only
export async function getServicesContent() {
  const content = await getServicesSupportContent();
  return content?.services || [];
}

export async function updateServicesContent(services, { requestUser } = {}) {
  if (!Array.isArray(services)) {
    const err = new Error('Services must be an array');
    err.statusCode = 400;
    throw err;
  }

  const content = await getServicesSupportContent() || {};
  const nextValue = { ...content, services };
  const row = await upsertSiteContentByKey(SERVICES_SUPPORT_KEY, nextValue, { requestUser });
  return row?.value?.services || [];
}

// Support only
export async function getSupportContent() {
  const content = await getServicesSupportContent() || {};
  return {
    support: content.support || {},
    safety_rules: content.safety_rules || []
  };
}

export async function updateSupportContent(payload, { requestUser } = {}) {
  const content = await getServicesSupportContent() || {};
  const nextValue = {
    ...content,
  };
  if (payload.support !== undefined) nextValue.support = payload.support;
  if (payload.safety_rules !== undefined) nextValue.safety_rules = payload.safety_rules;
  const row = await upsertSiteContentByKey(SERVICES_SUPPORT_KEY, nextValue, { requestUser });
  return {
    support: row?.value?.support || {},
    safety_rules: row?.value?.safety_rules || []
  };
}
