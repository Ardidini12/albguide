import { getServicesSupportContent, updateServicesSupportContent, getServicesContent, updateServicesContent, getSupportContent, updateSupportContent } from '../services/siteContentService.js';

export async function getServicesSupport(req, res) {
  try {
    const content = await getServicesSupportContent();
    if (!content) return res.status(404).json({ message: 'Content not found' });
    return res.json({ content });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateServicesSupport(req, res) {
  try {
    const content = await updateServicesSupportContent(req.body || {}, { requestUser: req.user });
    return res.json({ content });
  } catch (err) {
    if (err?.statusCode) {
      return res.status(err.statusCode).json({ message: err.message || 'Bad request' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Services only
export async function getServices(req, res) {
  try {
    const services = await getServicesContent();
    return res.json({ services });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateServices(req, res) {
  try {
    const services = await updateServicesContent(req.body?.services || [], { requestUser: req.user });
    return res.json({ services });
  } catch (err) {
    if (err?.statusCode) {
      return res.status(err.statusCode).json({ message: err.message || 'Bad request' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Support only
export async function getSupport(req, res) {
  try {
    const support = await getSupportContent();
    return res.json(support);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateSupport(req, res) {
  try {
    const support = await updateSupportContent(req.body || {}, { requestUser: req.user });
    return res.json(support);
  } catch (err) {
    if (err?.statusCode) {
      return res.status(err.statusCode).json({ message: err.message || 'Bad request' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
