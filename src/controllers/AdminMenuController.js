const pool = require("../config/db");

async function AdminMenuController(req, res) {
    try {
        const [rows] = await pool.query(`
      SELECT 
        u.username,
        i.total_amount,
        i.order_status,
        i.payment_status,
        i.invoice_id,
        p.name AS product_name,
        it.quantity,
        it.unit_price,
        it.line_total
      FROM users u
      JOIN invoice i ON u.id = i.customer_id
      JOIN invoice_item it ON it.invoice_id = i.invoice_id
      JOIN menu p ON p.id = it.product_id
      
    `);

        // ✅ Grouping logic (Option 1)
        const result = Object.values(
            rows.reduce((acc, row) => {
                if (!acc[row.invoice_id]) {
                    acc[row.invoice_id] = {
                        username: row.username,
                        total_amount: row.total_amount,
                        order_status:row.order_status,
                        payment_status:row.payment_status,
                        invoice_id: row.invoice_id,
                        products: []
                    };
                }

                acc[row.invoice_id].products.push({
                    product_name: row.product_name,
                    quantity: row.quantity,
                    unit_price: row.unit_price,
                    line_total: row.line_total
                });

                return acc;
            }, {})
        );

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Database error" });
    }
}

module.exports = AdminMenuController;
