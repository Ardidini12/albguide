import { listMyFavorites, toggleFavorite } from '../services/favoriteService.js';

export async function listMe(req, res) {
  try {
    const favorites = await listMyFavorites(req.user.sub);
    return res.json({ favorites });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function toggle(req, res) {
  const packageId = req.body?.package_id;
  if (!packageId) {
    return res.status(400).json({ message: 'package_id is required' });
  }

  try {
    const result = await toggleFavorite({ userId: req.user.sub, packageId: String(packageId) });
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
