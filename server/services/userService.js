import { hashPassword, verifyPassword } from '../utils/password.js';
import crypto from 'crypto';
import { getSupabaseAdmin, getSupabaseBucket } from '../config/supabase.js';
import { createSignedReadUrl, deleteFromStorage, extractPathFromSignedUrl } from './storageService.js';
import {
  createUser,
  deleteUserById,
  findUserById,
  findUserByEmailWithPassword,
  listUsers,
  updateUserById,
  updateUserProfilePicture,
} from '../models/userModel.js';

export async function getUserMe(userId) {
  return await findUserById(userId);
}

export async function getUsers() {
  return await listUsers();
}

export async function getUser(id) {
  return await findUserById(id);
}

export async function createUserAdmin({ email, password, name, isAdmin }) {
  const passwordHash = await hashPassword(password);
  return await createUser({ email, passwordHash, name, isAdmin: Boolean(isAdmin) });
}

export async function updateUser(id, { email, name, password, isAdmin }) {
  return await updateUserById(id, {
    email,
    name,
    passwordHash: password !== undefined ? await hashPassword(password) : undefined,
    isAdmin,
  });
}

export async function deleteUser(id) {
  return await deleteUserById(id);
}

export async function updateUserMe(userId, { name }) {
  return await updateUserById(userId, { name });
}

export async function changePassword(userId, currentPassword, newPassword) {
  const userById = await findUserById(userId);
  if (!userById) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  const user = await findUserByEmailWithPassword(userById.email);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const isValid = await verifyPassword(currentPassword, user.password_hash);
  if (!isValid) {
    const err = new Error('Current password is incorrect');
    err.statusCode = 401;
    throw err;
  }

  const newPasswordHash = await hashPassword(newPassword);
  return await updateUserById(userId, { passwordHash: newPasswordHash });
}

function getExtensionFromMime(mime) {
  const m = String(mime || '').toLowerCase();
  if (m === 'image/jpeg') return 'jpg';
  if (m === 'image/png') return 'png';
  if (m === 'image/webp') return 'webp';
  if (m === 'image/gif') return 'gif';
  return '';
}

export async function signProfilePictureUpload({ userId, contentType, fileSize }) {
  const MAX_SIZE = 5 * 1024 * 1024;
  if (fileSize > MAX_SIZE) {
    const err = new Error('File size must be less than 5MB');
    err.statusCode = 400;
    throw err;
  }

  const ext = getExtensionFromMime(contentType);
  if (!ext) {
    const err = new Error('Unsupported file type');
    err.statusCode = 400;
    throw err;
  }

  const bucket = getSupabaseBucket();
  const supabase = getSupabaseAdmin();

  const randomName = crypto.randomBytes(16).toString('hex');
  const path = `profile-pictures/${userId}/${randomName}.${ext}`;

  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
  if (error || !data?.token) {
    const err = new Error('Unable to create signed upload URL');
    err.statusCode = 500;
    throw err;
  }

  const signedReadUrl = await createSignedReadUrl(path, 3600);

  return {
    bucket,
    path,
    token: data.token,
    uploadUrl: data.signedUrl,
    signedReadUrl,
  };
}

export async function registerProfilePicture({ userId, path }) {
  if (!path) {
    const err = new Error('path is required');
    err.statusCode = 400;
    throw err;
  }

  if (!String(path).startsWith(`profile-pictures/${userId}/`)) {
    const err = new Error('Invalid path');
    err.statusCode = 400;
    throw err;
  }

  const signedUrl = await createSignedReadUrl(path, 31536000);
  return await updateUserProfilePicture(userId, signedUrl);
}

export async function deleteProfilePicture(userId) {
  const user = await findUserById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  if (user.profile_picture) {
    const path = extractPathFromSignedUrl(user.profile_picture);
    if (path) {
      const result = await deleteFromStorage(path);
      // Ignore 404 errors - file already deleted is fine
      if (!result.success && result.error?.statusCode !== '404') {
        console.warn('Failed to delete profile picture from storage:', result.error);
      }
    }
  }

  return await updateUserProfilePicture(userId, null);
}
