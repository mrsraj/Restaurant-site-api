
require('dotenv').config();
const crypto = require("crypto");
const pool = require("../../config/db");


const verifyPayment = (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        // 1️⃣ Validate request
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing payment details",
            });
        }

        // 2️⃣ Verify signature
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Invalid signature",
            });
        }

        // 3️⃣ Example values (REPLACE with real data)
        const invoice_id = 50;        // your internal order/invoice ID
        const customer_id = 5;        // logged-in user ID
        const amount = 500.00;         // must come from backend, NOT frontend
        const method = "card";         // card / upi / bank_transfer

        // 4️⃣ Insert into YOUR payment table
        const sql = `INSERT INTO payment
                    (invoice_id, customer_id, payment_date, amount, method, reference_number)
                    VALUES (?, ?, CURDATE(), ?, ?, ?)
                    `;

        pool.query(sql, [invoice_id, customer_id, amount, method, razorpay_payment_id],
            (err, result) => {
                if (err) {
                    console.error("DB Error:", err);
                    return res.status(500).json({
                        success: false,
                        message: "Database error",
                    });
                }

                return res.status(200).json({
                    success: true,
                    message: "Payment verified & saved successfully",
                });
            }
        );

    } catch (error) {
        console.error("Verification Error:", error);
        return res.status(500).json({
            success: false,
            message: "Payment verification failed",
        });
    }
};

module.exports = verifyPayment;
