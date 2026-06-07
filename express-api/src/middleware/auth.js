import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export function verifyJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  // Expects: "Authorization: Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    // Attach decoded payload to req so controllers can read req.user.id
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
}