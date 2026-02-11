import { verifyToken } from '../services/jwtService.js';
import { findUserById } from '../models/userModel.js';

export async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next();
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = verifyToken(token);
    
    // Core fix: verify user actually exists in DB
    const user = await findUserById(payload.sub);
    if (user) {
      req.user = payload;
    }
  } catch {
  }

  return next();
}
