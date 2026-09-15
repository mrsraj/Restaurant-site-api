const AppError = require('../../utils/app-error');
module.exports = async (input = {}, context = {}) => {
  const [rows] = await require("../../config/db").query('SELECT * FROM menu WHERE id = ? AND restaurant_id = ?', [context.params.id, context.restaurantId]);
  if (!rows.length) throw new AppError(404, {
    message: 'Menu item not found'
  });
  return {
    success: true,
    data: rows[0]
  };
};
