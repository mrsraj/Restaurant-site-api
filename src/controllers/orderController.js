const { createInvoice } = require("../models/InvoiceModel");
const { createInvoiceLine } = require("../models/InvoiceLineModel");
const { PaymentCreation } = require("../models/PaymentModel");
const pool = require('../config/db')

exports.placeOrder = async (req, res) => {
    const {
        user_id,
        cart,
        total,
        method,          // e.g. 'cash', 'card', 'upi'
        reference_number, // optional
        payment_date,     // optional
    } = req.body;

    if (!user_id || !cart || !Array.isArray(cart) || cart.length === 0) {
        return res.status(400).json({ message: "Invalid order data" });
    }

   let conn;

    try {
        // Get connection & start transaction
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // 1. Create invoice
        const invoice = await createInvoice(user_id, new Date(), total);
        console.log("invoice_id = ", invoice.invoice_id);

        const order_id = invoice.invoice_id;

        // 2. Insert invoice lines
        for (const item of cart) {
            const { id, finalPrice, qty } = item;
            const line_total = finalPrice * qty;

            await createInvoiceLine(order_id, id, qty, finalPrice, line_total);
        }

        // 3. Create payment
        await PaymentCreation(
            order_id,
            user_id,
            payment_date || new Date(),
            total,
            method,
            reference_number || null
        );

        // 4. If everything is OK -> COMMIT
        await conn.commit();

        res.json({
            message: "Order placed successfully",
            invoice_id: order_id,
        });

    } catch (error) {
        console.error("placeOrder error:", error);
        // If any error -> ROLLBACK
        if (conn) {
            try {
                await conn.rollback();
            } catch (rollbackErr) {
                console.error("Rollback error:", rollbackErr);
            }
        }
        res.status(400).json({ message: error.message || "Order failed" });

    } finally {
        if (conn) conn.release(); // release connection back to pool
    }
};



// 2.1 Check stock
// const [rows] = await connection.query(
//     "SELECT stock FROM products WHERE id = ?",
//     [product_id]
// );

// if (rows.length === 0) {
//     throw new Error(`Product not found: ${product_id}`);
// }

// const availableStock = rows[0].stock;

// if (qty > availableStock) {
//     throw new Error(
//         `Only ${availableStock} items available for product ID ${product_id}`
//     );
// }

// 2.2 Reduce stock
// await connection.query(
//     "UPDATE products SET stock = stock - ? WHERE id = ?",
//     [qty, product_id]
// );