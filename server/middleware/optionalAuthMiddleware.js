import { verifyToken } from '../services/jwtService.js';
import { findUserById } from '../models/userModel.js';

export async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next();
  }

  const token = header.slice('Bearer '.length);

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    // Invalid token, treat as guest
    return next();
  }

  if (payload) {
    try {
      const user = await findUserById(payload.sub);
      if (user) {
        req.user = payload;
      }
    } catch (dbErr) {
      console.error('[optionalAuth] DB Error looking up user:', dbErr);
      // Propagate DB errors instead of swallowing
      return next(dbErr);
    }
  }

  return next();
}
