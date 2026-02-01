import {
  createUserAdmin,
  deleteUser,
  getUser,
  getUserMe,
  getUsers,
  updateUser,
} from '../services/userService.js';

export async function getMe(req, res) {
  try {
    const user = await getUserMe(req.user.sub);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function list(req, res) {
  try {
    const users = await getUsers();
    return res.json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getById(req, res) {
  try {
    const user = await getUser(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function create(req, res) {
  const { email, password, name, is_admin } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  try {
    const user = await createUserAdmin({ email, password, name, isAdmin: is_admin });
    return res.status(201).json({ user });
  } catch (err) {
    if (String(err?.code) === '23505') {
      return res.status(409).json({ message: 'Email already exists' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function update(req, res) {
  const { email, name, password, is_admin } = req.body || {};

  try {
    const updated = await updateUser(req.params.id, {
      email,
      name,
      password,
      isAdmin: is_admin,
    });

    if (!updated) return res.status(404).json({ message: 'User not found' });
    return res.json({ user: updated });
  } catch (err) {
    if (String(err?.code) === '23505') {
      return res.status(409).json({ message: 'Email already exists' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function remove(req, res) {
  try {
    const deletedId = await deleteUser(req.params.id);
    if (!deletedId) return res.status(404).json({ message: 'User not found' });
    return res.json({ deletedId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
