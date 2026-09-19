import pool from '../../config/db.js';
import AppError from '../../utils/app-error.js';

export default async (input = {}, context = {}) => {
  const [rows] = await pool.query(
    'SELECT * FROM menu WHERE id = ? AND restaurant_id = ?',
    [context.params.id, context.restaurantId],
  );

  if (!rows.length) {
    throw new AppError(404, {
      message: 'Menu item not found',
    });
  }

  return {
    success: true,
    data: rows[0],
  };
};
