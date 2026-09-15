const AppError = require('../../utils/app-error');
const pool = require("../../config/db");
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
module.exports = OrderStatus;
