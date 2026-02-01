import { verifyToken } from '../services/jwtService.js';

export function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing Authorization header' });
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = verifyToken(token);
    req.user = payload;
    return next();
  } catch (err) {
    if (String(err?.message || '').includes('JWT_SECRET is not set')) {
      return res.status(500).json({ message: 'Server misconfigured: JWT_SECRET is not set' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
}
