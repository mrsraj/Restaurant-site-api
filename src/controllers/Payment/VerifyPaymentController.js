require("dotenv").config();
const crypto = require("crypto");
const Razorpay = require("razorpay");
const pool = require("../../config/db");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            invoice_id = 50,
            customer_id = 5
        } = req.body;

        // 1️⃣ Validate required fields
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing payment details"
            });
        }

        // 2️⃣ Verify signature
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            await razorpay.payments.refund(razorpay_payment_id);

            return res.status(400).json({
                success: false,
                message: "Invalid signature. Payment refunded."
            });
        }

        // 3️⃣ Fetch payment details from Razorpay (IMPORTANT)
        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        const amount = payment.amount / 100; // paise → INR
        const method = payment.method;        // card / upi / netbanking

        // 4️⃣ Save payment in DB
        const sql = `
            INSERT INTO payment
            (invoice_id, customer_id, payment_date, amount, method, reference_number)
            VALUES (?, ?, CURDATE(), ?, ?, ?)
        `;

        pool.query(
            sql,
            [invoice_id, customer_id, amount, method, razorpay_payment_id],
            async (err) => {
                if (err) {
                    console.error("DB Error:", err);

                    // Refund if DB fails
                    await razorpay.payments.refund(razorpay_payment_id);

                    return res.status(500).json({
                        success: false,
                        message: "Database error. Payment refunded."
                    });
                }

                return res.status(200).json({
                    success: true,
                    message: "Payment verified and stored successfully"
                });
            }
        );

    } catch (error) {
        console.error("Verification Error:", error);

        return res.status(500).json({
            success: false,
            message: "Payment verification failed"
        });
    }
};

module.exports = verifyPayment;
