import AppError from '../../utils/app-error.js';
import pool from '../../config/db.js';
async function GetCategory(input = {}, context = {}) {
  try {
    const [categories] = await pool.query('SELECT id, c_name FROM categories WHERE restaurant_id = ?', [context.restaurantId]);
    return categories;
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error(error);
    throw new AppError(500, {
      message: 'Failed to fetch categories'
    });
  }
}
export default GetCategory;
