import { hashPassword } from '../utils/password.js';
import { createUser, ensureAdminByEmail, findUserByEmailWithPassword } from '../models/userModel.js';

export async function seedSuperuser() {
  const email = process.env.SUPERUSER_EMAIL;
  const password = process.env.SUPERUSER_PASSWORD;
  const name = process.env.SUPERUSER_NAME;

  if (!email || !password) {
    return;
  }

  const existing = await findUserByEmailWithPassword(email);
  if (!existing) {
    const passwordHash = hashPassword(password);
    await createUser({ email, passwordHash, name, isAdmin: true });
    return;
  }

  if (!existing.is_admin) {
    await ensureAdminByEmail(email);
  }
}
