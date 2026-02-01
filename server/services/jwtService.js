import jwt from 'jsonwebtoken';

export function signToken(payload, options = {}) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d', ...options });
}

export function verifyToken(token) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set');
  }
  return jwt.verify(token, process.env.JWT_SECRET);
}
