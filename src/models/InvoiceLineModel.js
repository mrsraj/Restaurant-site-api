const pool = require("../config/db");

exports.createInvoiceLine = async (conn,order_id, product_id, qty, finalPrice, line_total) => {
    try {
        const [result] = await conn.query(
            `INSERT INTO invoice_item (invoice_id, product_id, quantity, unit_price, line_total)
             VALUES (?, ?, ?, ?, ?)`,
            [order_id, product_id, qty, finalPrice, line_total]
        );

        return {
            success: true,
            invoice_item_id: result.insertId
        };

    } catch (error) {
        console.error("Invoice line insert error:", error);
        throw error;
    }
};
