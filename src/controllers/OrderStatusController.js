const pool = require("../config/db");

async function OrderStatus(req, res) {
    try {
        const { invoice_id } = req.params;  // or req.body / req.query based on your route

        const [orderStatus] = await pool.query(
            "SELECT * FROM invoice WHERE invoice_id = ?",
            [invoice_id]
        );

        res.status(200).json({
            success: true,
            data: orderStatus
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
