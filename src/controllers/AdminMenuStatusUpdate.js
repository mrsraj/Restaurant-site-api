
const pool = require("../config/db");

async function MenuStatusUpdate(req, res) {
    const { id, order_status, payment_status } = req.body;

    if (!id) {
        return res.status(400).json({ message: "Invoice ID required" });
    }

    try {
        let query = "";
        let values = [];

        // 🔹 Update ORDER STATUS
        if (order_status) {
            const allowedOrderStatus = ["accepted", "cancelled"];

            if (!allowedOrderStatus.includes(order_status)) {
                return res.status(400).json({ message: "Invalid order status" });
            }

            query = `UPDATE invoice SET order_status = ? WHERE invoice_id = ? AND order_status = 'pending'`;
            values = [order_status, id];
        }

        // 🔹 Update PAYMENT STATUS
        else if (payment_status) {
            const allowedPaymentStatus = ['paid', 'unpaid'];

            if (!allowedPaymentStatus.includes(payment_status)) {
                return res.status(400).json({ message: "Invalid payment status" });
            }

            // payment only after accepted
            query = `UPDATE invoice SET payment_status = ? WHERE invoice_id = ? AND payment_status = 'pending'`;
            values = [payment_status, id];
        }
        else {
            return res.status(400).json({ message: "No status provided" });
        }

        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(400).json({
                message: "Status update not allowed or invoice not found"
            });
        }

        return res.status(200).json({
            message: "Status updated successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Database error" });
    }
}

module.exports = MenuStatusUpdate;
