import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated.' });
  // Read secret lazily so dotenv has already been called by server.js
  const secret = process.env.JWT_SECRET || 'makeventory-dev-secret-change-me';
  try {
    req.user = jwt.verify(token, secret);
    next();
  } catch {
    res.clearCookie('token');
    res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}
