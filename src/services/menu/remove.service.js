const AppError = require('../../utils/app-error');
const pool = require("../../config/db");
const DeleteMenu = async (input = {}, context = {}) => {
  try {
    const {
      id
    } = context.params;
    if (!id) {
      throw new AppError(400, {
        message: "Menu item ID is required"
      });
    }
    const [result] = await pool.query("DELETE FROM menu WHERE id = ? AND restaurant_id = ?", [id, context.restaurantId]);
    if (result.affectedRows === 0) {
      throw new AppError(404, {
        message: "Menu item not found"
      });
    }
    return null;
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Delete Menu Error:", error);
    throw new AppError(500, {
      message: "Internal server error"
    });
  }
};
module.exports = DeleteMenu;
