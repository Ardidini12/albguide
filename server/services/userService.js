import { hashPassword } from '../utils/password.js';
import {
  createUser,
  deleteUserById,
  findUserById,
  listUsers,
  updateUserById,
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
