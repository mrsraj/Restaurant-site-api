const pool = require("../config/db");

async function OrderStatus(req, res) {
    try {
        const invoice_id = req.params.id;  // or req.body / req.query based on your route

        const [orderStatus] = await pool.query(
            "SELECT * FROM invoice WHERE invoice_id = ? AND customer_id = ?",
            [invoice_id, req.user.id]
        );

        if (!orderStatus.length) return res.status(404).json({ message: "Order not found" });
        res.status(200).json({
            success: true,
            data: orderStatus[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

module.exports = OrderStatus;
