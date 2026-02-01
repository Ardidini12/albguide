import crypto from 'crypto';

function pbkdf2Async(password, salt, iterations, keylen, digest) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey);
    });
  });
}

function scryptAsync(password, salt, keylen, options) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, keylen, options, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey);
    });
  });
}

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, 32, { N: 16384, r: 8, p: 1 });
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password, stored) {
  const value = String(stored || '');

  if (value.startsWith('scrypt:')) {
    const [, salt, expected] = value.split(':');
    if (!salt || !expected) return false;
    const derivedKey = await scryptAsync(password, salt, 32, { N: 16384, r: 8, p: 1 });
    const expectedBuf = Buffer.from(expected, 'hex');
    if (expectedBuf.length !== derivedKey.length) return false;
    return crypto.timingSafeEqual(derivedKey, expectedBuf);
  }

  const [salt, expected] = value.split(':');
  if (!salt || !expected) return false;
  const derivedKey = await pbkdf2Async(password, salt, 120000, 32, 'sha256');
  const expectedBuf = Buffer.from(expected, 'hex');
  if (expectedBuf.length !== derivedKey.length) return false;
  return crypto.timingSafeEqual(derivedKey, expectedBuf);
}
