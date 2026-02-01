export function rateLimit({ windowMs, max, key = (req) => req.ip } = {}) {
  const windowMsSafe = Number.isFinite(windowMs) ? windowMs : 60_000;
  const maxSafe = Number.isFinite(max) ? max : 20;

  const hits = new Map();

  return function rateLimitMiddleware(req, res, next) {
    const now = Date.now();
    const k = String(key(req) || '');

    const arr = hits.get(k) || [];
    const filtered = arr.filter((t) => now - t < windowMsSafe);
    filtered.push(now);
    hits.set(k, filtered);

    if (filtered.length > maxSafe) {
      return res.status(429).json({ message: 'Too many requests, please try again later' });
    }

    return next();
  };
}
