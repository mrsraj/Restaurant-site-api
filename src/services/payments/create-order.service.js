const AppError = require('../../utils/app-error');
const razorpay = require("../../config/razorpay");
const createOrder = async (input = {}, context = {}) => {
  try {
    const {
      amount
    } = input;
    if (!amount) {
      throw new AppError(400, {
        message: "Amount is required"
      });
    }
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now()
    };
    const order = await razorpay.orders.create(options);
    return order;
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error(err);
    throw new AppError(500, {
      message: "Order creation failed",
      error: err
    });
  }
};
module.exports = createOrder;
