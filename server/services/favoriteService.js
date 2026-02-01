import {
  addFavorite,
  isFavorite,
  listFavoritesByUser,
  removeFavorite,
} from '../models/favoriteModel.js';

export async function listMyFavorites(userId) {
  return await listFavoritesByUser(userId);
}

export async function toggleFavorite({ userId, packageId }) {
  const exists = await isFavorite({ userId, packageId });
  if (exists) {
    await removeFavorite({ userId, packageId });
    return { favorite: false };
  }

  await addFavorite({ userId, packageId });
  return { favorite: true };
}
