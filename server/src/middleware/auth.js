import jwt from 'jsonwebtoken';

/** Protects write routes — expects: Authorization: Bearer <jwt> */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) {
    return res.status(401).json({ error: 'Missing bearer token. Log in at POST /api/auth/login.' });
  }
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
}

/**
 * Restricts a route to certain roles. A token issued before roles existed has no
 * `role` claim, so it is treated as an admin — those are all admin logins.
 * Use after requireAuth: `app.put('/x', requireAuth, requireRole('admin'), ...)`
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    const role = req.admin?.role ?? 'admin';
    if (!roles.includes(role)) {
      return res.status(403).json({ error: 'Your account does not have access to this area.' });
    }
    return next();
  };
}
