const pool = require("../../config/db");

const paymentFailed = async (req, res) => {
    const { invoice_id } = req.body;

    try {
        await pool.query(
            "UPDATE invoice SET payment_status = 'failed' WHERE invoice_id = ?",
            [invoice_id]
        );

        // await pool.query(
        //     "UPDATE invoice SET order_status = 'cancelled' WHERE invoice_id = ?",
        //     [invoice_id]
        // );

        res.json({ message: "Payment marked as failed" });
    } catch (err) {
        res.status(500).json({ message: "Failed to update payment" });
    }
};

module.exports = paymentFailed;
