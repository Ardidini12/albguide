import { hashPassword, verifyPassword } from '../utils/password.js';
import { signToken } from './jwtService.js';
import { createUser, findUserByEmailWithPassword } from '../models/userModel.js';

const DUMMY_PASSWORD_HASH = 'scrypt:00000000000000000000000000000000:0000000000000000000000000000000000000000000000000000000000000000';

export async function registerUser({ email, password, name }) {
  const passwordHash = await hashPassword(password);
  const user = await createUser({ email, passwordHash, name, isAdmin: false });
  const token = signToken({ sub: user.id, email: user.email, is_admin: user.is_admin });
  return { token, user };
}

export async function loginUser({ email, password }) {
  const user = await findUserByEmailWithPassword(email);

  const hash = user ? user.password_hash : DUMMY_PASSWORD_HASH;
  const ok = await verifyPassword(password, hash);
  if (!ok) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  if (!user) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const token = signToken({ sub: user.id, email: user.email, is_admin: user.is_admin });
  delete user.password_hash;
  return { token, user };
}
