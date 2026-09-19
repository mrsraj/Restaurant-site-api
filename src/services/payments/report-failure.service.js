import AppError from '../../utils/app-error.js';
import pool from '../../config/db.js';
const paymentFailed = async (input = {}, context = {}) => {
  const {
    invoice_id,
    status
  } = input;
  if (status !== 'failed') throw new AppError(400, {
    message: 'Only failed payment notifications are accepted here'
  });
  try {
    await pool.query("UPDATE invoice SET payment_status = 'failed' WHERE invoice_id = ? AND payment_status != 'paid'", [invoice_id]);
    return {
      message: "Payment marked as failed"
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, {
      message: "Failed to update payment"
    });
  }
};
export default paymentFailed;
