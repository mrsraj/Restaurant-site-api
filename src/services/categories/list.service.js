const AppError = require('../../utils/app-error');
const pool = require("../../config/db");
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
module.exports = GetCategory;
