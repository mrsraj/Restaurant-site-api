import AppError from '../../utils/app-error.js';
import pool from '../../config/db.js';
const updateReservationStatus = async (input = {}, context = {}) => {
  const {
    status
  } = input;
  const id = context.params.id;
  const allowedStatus = ["confirmed", "cancelled", "done"];
  if (!allowedStatus.includes(status)) {
    throw new AppError(400, {
      message: "Invalid status value"
    });
  }
  try {
    const [result] = await pool.query(`UPDATE table_reservation SET status = ? WHERE id = ? AND restaurant_id = ?`, [status, id, context.restaurantId]);
    if (result.affectedRows === 0) {
      throw new AppError(404, {
        message: "Reservation not found"
      });
    }
    return {
      message: "Reservation status updated"
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Update reservation error:", error);
    throw new AppError(500, {
      message: "Internal server error"
    });
  }
};
export default updateReservationStatus;
