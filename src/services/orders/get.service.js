import AppError from '../../utils/app-error.js';
import pool from '../../config/db.js';
async function OrderStatus(input = {}, context = {}) {
  try {
    const invoice_id = context.params.id;
    const [orderStatus] = await pool.query("SELECT * FROM invoice WHERE invoice_id = ? AND customer_id = ?", [invoice_id, context.user.id]);
    if (!orderStatus.length) throw new AppError(404, {
      message: "Order not found"
    });
    return {
      success: true,
      data: orderStatus[0]
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error(error);
    throw new AppError(500, {
      success: false,
      message: "Internal Server Error"
    });
  }
}
export default OrderStatus;
