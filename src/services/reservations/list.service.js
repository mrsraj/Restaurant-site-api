const AppError = require('../../utils/app-error');
const pool = require("../../config/db");
async function getTableReservation(input = {}, context = {}) {
  try {
    const [rows] = await pool.query(context.user.role === 'user' ? "SELECT * FROM table_reservation WHERE user_id = ? ORDER BY created_at DESC" : "SELECT * FROM table_reservation WHERE restaurant_id = ? ORDER BY created_at DESC", [context.user.role === 'user' ? context.user.id : context.restaurantId]);
    return rows;
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("GetTableReservation error:", error);
    throw new AppError(500, {
      message: "Internal server error"
    });
  }
}
module.exports = getTableReservation;
