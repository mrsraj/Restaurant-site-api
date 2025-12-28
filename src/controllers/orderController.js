const { createInvoice } = require("../models/InvoiceModel");
const { createInvoiceLine } = require("../models/InvoiceLineModel");
const { PaymentCreation } = require("../models/PaymentModel");
const pool = require("../config/db");
const razorpay = require("../config/razorpay");

exports.placeOrder = async (req, res) => {
    const {
        user_id,
        cart,
        total,
        method, // "cash" | "online"
        name
    } = req.body;

    if (!user_id || !Array.isArray(cart) || cart.length === 0) {
        return res.status(400).json({ message: "Invalid order data" });
    }

    let conn;

    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // 1️⃣ Create invoice (ORDER)
        const invoice = await createInvoice(conn, user_id, new Date(), total);
        const order_id = invoice.invoice_id;

        // 2️⃣ Insert invoice items
        for (const item of cart) {
            const { id, finalPrice, qty } = item;
            await createInvoiceLine(
                conn,
                order_id,
                id,
                qty,
                finalPrice,
                finalPrice * qty
            );
        }

        let razorpayOrder = null;

        // 3️⃣ CASH PAYMENT (IMMEDIATE)
        if (method === "cash") {
            await PaymentCreation(
                conn,
                order_id,
                user_id,
                new Date(),
                total,
                "cash",
                null
            );

            await conn.commit();

            return res.json({
                success: true,
                message: "Cash order placed successfully",
                invoice_id: order_id
            });
        }

        // 4️⃣ ONLINE PAYMENT (RAZORPAY ORDER ONLY)
        if (method != "cash") {
            await conn.commit(); // commit DB first

            razorpayOrder = await razorpay.orders.create({
                amount: total * 100,
                currency: "INR",
                receipt: `order_${order_id}`
            });

            // await pool.query(
            //     "UPDATE invoice SET razorpay_order_id = ? WHERE invoice_id = ?",
            //     [razorpayOrder.id, order_id]
            // );

            return res.json({
                success: true,
                message: "Order created. Proceed to payment",
                invoice_id: order_id,
                razorpayOrder
            });
        }

        throw new Error("Invalid payment method");

    } catch (error) {
        if (conn) await conn.rollback();
        console.error("placeOrder error:", error);
        res.status(500).json({ message: "Order failed" });
    } finally {
        if (conn) conn.release();
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