const razorpay = require("../../config/razorpay"); // adjust path as needed

const createOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount) {
            return res.status(400).json({ message: "Amount is required" });
        }

        const options = {
            amount: amount * 100, // INR → paise
            currency: "INR",
            receipt: "receipt_" + Date.now(),
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json(order);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Order creation failed", error: err });
    }
};

module.exports = createOrder;
