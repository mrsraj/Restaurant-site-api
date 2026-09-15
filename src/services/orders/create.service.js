const orderEvents = require('../../sockets/order-events');
const AppError = require('../../utils/app-error');
const {
  createInvoice
} = require("../../models/invoice.model");
const {
  createInvoiceLine
} = require("../../models/invoice-item.model");
const {
  PaymentCreation
} = require("../../models/payment.model");
const pool = require("../../config/db");
const razorpay = require("../../config/razorpay");
module.exports = async (input = {}, context = {}) => {
  const {
    cart,
    method,
    name
  } = input;
  const user_id = context.user.id;
  let total = 0;
  if (!['cash', 'online'].includes(method)) throw new AppError(400, {
    message: 'Invalid payment method'
  });
  if (!user_id || !Array.isArray(cart) || cart.length === 0) {
    throw new AppError(400, {
      message: "Invalid order data"
    });
  }
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let restaurantId;
    for (const item of cart) {
      if (!Number.isSafeInteger(Number(item.id)) || !Number.isSafeInteger(Number(item.qty)) || Number(item.qty) < 1) {
        await conn.rollback();
        throw new AppError(400, {
          message: 'Invalid cart item'
        });
      }
      const [rows] = await conn.query('SELECT restaurant_id, price, discount, is_active FROM menu WHERE id = ?', [item.id]);
      const product = rows[0];
      if (!product || !product.is_active || !product.restaurant_id || restaurantId && restaurantId !== product.restaurant_id) {
        await conn.rollback();
        throw new AppError(400, {
          message: 'Order must contain available items from one restaurant'
        });
      }
      restaurantId = product.restaurant_id;
      item.finalPrice = Math.round(Number(product.price) * (1 - Number(product.discount || 0) / 100) * 100) / 100;
      item.qty = Number(item.qty);
      total += item.finalPrice * item.qty;
    }
    total = Math.round(total * 100) / 100;
    const invoice = await createInvoice(conn, user_id, new Date(), total, restaurantId);
    const order_id = invoice.invoice_id;
    for (const item of cart) {
      const {
        id,
        finalPrice,
        qty
      } = item;
      await createInvoiceLine(conn, order_id, id, qty, finalPrice, finalPrice * qty);
    }
    let razorpayOrder = null;
    if (method === "cash") {
      await PaymentCreation(conn, order_id, user_id, new Date(), total, "cash", null);
      await conn.commit();
      orderEvents.emit('changed', order_id);
      return {
        success: true,
        message: "Cash order placed successfully",
        invoice_id: order_id
      };
    }
    if (method != "cash") {
      await conn.commit();
      orderEvents.emit('changed', order_id);
      razorpayOrder = await razorpay.orders.create({
        amount: total * 100,
        currency: "INR",
        receipt: `order_${order_id}`
      });
      return {
        success: true,
        message: "Order created. Proceed to payment",
        invoice_id: order_id,
        razorpayOrder
      };
    }
    throw new Error("Invalid payment method");
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (conn) await conn.rollback();
    console.error("placeOrder error:", error);
    throw new AppError(500, {
      message: "Order failed"
    });
  } finally {
    if (conn) conn.release();
  }
};
