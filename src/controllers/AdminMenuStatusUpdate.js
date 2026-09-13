
const pool = require("../config/db");

async function MenuStatusUpdate(req, res) {
    const { order_status, payment_status } = req.body;
    const id = req.params.id;
    if (order_status !== undefined && payment_status !== undefined) return res.status(400).json({ message: 'Update one status at a time' });

    if (req.user.role === 'kitchen' && payment_status !== undefined) {
        return res.status(403).json({ message: 'Kitchen staff cannot change payments' });
    }
    if (!id) {
        return res.status(400).json({ message: "Invoice ID required" });
    }

    try {
        let query = "";
        let values = [];

        // dY"1 Update ORDER STATUS
        if (order_status) {
            const allowedOrderStatus = ["accepted", "cancelled","delivered"];

            if (!allowedOrderStatus.includes(order_status)) {
                return res.status(400).json({ message: "Invalid order status" });
            }

            query = `UPDATE invoice SET order_status = ? WHERE invoice_id = ?`;
            values = [order_status, id];
        }

        // dY"1 Update PAYMENT STATUS
        else if (payment_status) {
            const allowedPaymentStatus = ['paid', 'unpaid'];

            if (!allowedPaymentStatus.includes(payment_status)) {
                return res.status(400).json({ message: "Invalid payment status" });
            }

            // payment only after accepted
            query = `UPDATE invoice SET payment_status = ? WHERE invoice_id = ? `;
            values = [payment_status, id];
        }
        else {
            return res.status(400).json({ message: "No status provided" });
        }

        query += ' AND restaurant_id = ?';
        values.push(req.restaurantId);
        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Order not found"
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
