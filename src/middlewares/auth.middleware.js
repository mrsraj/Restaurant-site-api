import {
  roleSql
} from '../config/roles.js';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
async function authenticate(req, res, next) {
  const match = /^Bearer (\S+)$/i.exec(req.headers.authorization || '');
  if (!match) return res.status(401).json({
    message: 'Authentication required'
  });
  let decoded;
  try {
    decoded = jwt.verify(match[1], process.env.JWT_SECRET, {
      algorithms: ['HS256']
    });
    if (!Number.isSafeInteger(decoded.id)) throw new Error('Invalid identity');
  } catch {
    return res.status(401).json({
      message: 'Invalid or expired token. Please log in again.'
    });
  }
  try {
    const [users] = await pool.query('SELECT u.id, u.username, u.restaurant_id, u.role_id, ' + roleSql + ' AS role FROM users u JOIN roles r ON r.role_id = u.role_id WHERE u.id = ? AND u.isActive = 1 AND r.isActive = 1', [decoded.id]);
    const user = users[0];
    if (!user || !['user', 'super_admin', 'restaurant_admin', 'kitchen'].includes(user.role)) return res.status(401).json({
      message: 'Account unavailable'
    });
    if (['restaurant_admin', 'kitchen'].includes(user.role) && !user.restaurant_id) return res.status(403).json({
      message: 'Restaurant assignment required'
    });
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
export default authenticate;
