const pool = require("../../config/db");

const paymentFailed = async (req, res) => {
    const { invoice_id, status } = req.body;
    if (status !== 'failed') return res.status(400).json({ message: 'Only failed payment notifications are accepted here' });

    try {
        await pool.query(
            "UPDATE invoice SET payment_status = 'failed' WHERE invoice_id = ? AND payment_status != 'paid'",
            [invoice_id]
        );

        // await pool.query(
        //     "UPDATE invoice SET order_status = 'cancelled' WHERE invoice_id = ? AND payment_status != 'paid'",
        //     [invoice_id]
        // );

        res.json({ message: "Payment marked as failed" });
    } catch (err) {
        res.status(500).json({ message: "Failed to update payment" });
    }
};

module.exports = paymentFailed;
