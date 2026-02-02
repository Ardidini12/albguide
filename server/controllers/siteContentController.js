import { getServicesSupportContent, updateServicesSupportContent } from '../services/siteContentService.js';

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
