export function adminRequired(req, res, next) {
  if (!req.user?.is_admin) {
    return res.status(403).json({ message: 'Admin only' });
  }
  return next();
}
