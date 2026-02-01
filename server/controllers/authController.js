import { loginUser, registerUser } from '../services/authService.js';

export async function register(req, res) {
  const { email, password, name } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  try {
    const result = await registerUser({ email, password, name });
    return res.status(201).json(result);
  } catch (err) {
    if (String(err?.code) === '23505') {
      return res.status(409).json({ message: 'Email already exists' });
    }
    if (String(err?.message || '').includes('JWT_SECRET is not set')) {
      return res.status(500).json({ message: 'Server misconfigured: JWT_SECRET is not set' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  try {
    const result = await loginUser({ email, password });
    return res.json(result);
  } catch (err) {
    if (err?.statusCode === 401) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (String(err?.message || '').includes('JWT_SECRET is not set')) {
      return res.status(500).json({ message: 'Server misconfigured: JWT_SECRET is not set' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
