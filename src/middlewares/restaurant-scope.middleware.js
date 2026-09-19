import pool from '../config/db.js';
export default async (req, res, next) => {
  const assigned = ['restaurant_admin', 'kitchen'].includes(req.user?.role);
  const selected = req.headers['x-restaurant-id'] ?? req.query.restaurant_id ?? req.body?.restaurant_id;
  const id = Number(assigned ? req.user.restaurant_id : selected ?? 1);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({
    message: 'Valid restaurant_id required'
  });
  if (assigned && selected !== undefined && Number(selected) !== id) return res.status(403).json({
    message: 'Access to another restaurant denied'
  });
  try {
    const [rows] = await pool.query('SELECT id FROM restaurants WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({
      message: 'Restaurant not found'
    });
    req.restaurantId = id;
    next();
  } catch (error) {
    next(error);
  }
};
