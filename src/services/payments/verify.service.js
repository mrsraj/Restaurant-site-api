import AppError from '../../utils/app-error.js';
import crypto from 'crypto';
import pool from '../../config/db.js';
import razorpay from '../../config/razorpay.js';
const verifyPayment = async (input = {}, context = {}) => {
  const conn = await pool.getConnection();
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      invoice_id,
      customer_id
    } = input;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !invoice_id) {
      throw new AppError(400, {
        success: false,
        message: "Missing payment details"
      });
    }
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body).digest("hex");
    if (expectedSignature !== razorpay_signature) {
      await razorpay.payments.refund(razorpay_payment_id);
      throw new AppError(400, {
        success: false,
        message: "Invalid signature. Payment refunded."
      });
    }
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    const amount = payment.amount / 100;
    const method = payment.method;
    await conn.beginTransaction();
    const [invoiceResult] = await conn.query(`UPDATE invoice SET payment_status = 'paid'
             WHERE invoice_id = ? AND payment_status != 'paid'
            `, [invoice_id]);
    if (invoiceResult.affectedRows === 0) {
      throw new Error("Invoice already paid or not found");
    }
    await conn.query(`INSERT INTO payment
            (invoice_id, customer_id, payment_date, amount, method, reference_number)
            VALUES (?, ?, NOW(), ?, ?, ?)
            `, [invoice_id, customer_id, amount, method, razorpay_payment_id]);
    await conn.commit();
    return {
      success: true,
      message: "Payment verified & invoice updated successfully"
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    await conn.rollback();
    console.error("Verification Error:", error);
    if (input?.razorpay_payment_id) {
      try {
        await razorpay.payments.refund(input.razorpay_payment_id);
      } catch (refundErr) {
        if (refundErr instanceof AppError) throw refundErr;
        console.error("Refund failed:", refundErr);
      }
    }
    throw new AppError(500, {
      success: false,
      message: "Payment verification failed. Amount refunded."
    });
  } finally {
    conn.release();
  }
};
export default verifyPayment;
