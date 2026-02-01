import { hashPassword, verifyPassword } from '../utils/password.js';
import { signToken } from './jwtService.js';
import { createUser, findUserByEmailWithPassword } from '../models/userModel.js';

export async function registerUser({ email, password, name }) {
  const passwordHash = hashPassword(password);
  const user = await createUser({ email, passwordHash, name, isAdmin: false });
  const token = signToken({ sub: user.id, email: user.email, is_admin: user.is_admin });
  return { token, user };
}

export async function loginUser({ email, password }) {
  const user = await findUserByEmailWithPassword(email);

  if (!user || !verifyPassword(password, user.password_hash)) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const token = signToken({ sub: user.id, email: user.email, is_admin: user.is_admin });
  delete user.password_hash;
  return { token, user };
}
