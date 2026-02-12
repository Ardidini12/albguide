import { verifyToken } from '../services/jwtService.js';
import { findUserById } from '../models/userModel.js';

export async function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing Authorization header' });
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = verifyToken(token);
    
    // Core fix: verify user actually exists in DB to prevent zombie-token FK errors
    const user = await findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'Invalid session: user no longer exists' });
    }

    req.user = payload;
    return next();
  } catch (err) {
    if (String(err?.message || '').includes('JWT_SECRET is not set')) {
      return res.status(500).json({ message: 'Server misconfigured: JWT_SECRET is not set' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next();
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = verifyToken(token);
    const user = await findUserById(payload.sub);
    if (user) {
      req.user = user;
    }
    return next();
  } catch (err) {
    // If token invalid, just proceed as guest
    return next();
  }
}
