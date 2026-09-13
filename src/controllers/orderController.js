const { createInvoice } = require("../models/InvoiceModel");
const { createInvoiceLine } = require("../models/InvoiceLineModel");
const { PaymentCreation } = require("../models/PaymentModel");
const pool = require("../config/db");
const razorpay = require("../config/razorpay");

exports.placeOrder = async (req, res) => {
    const {
        cart,
        method, // "cash" | "online"
        name
    } = req.body;

    const user_id = req.user.id;
    let total = 0;
    if (!['cash', 'online'].includes(method)) return res.status(400).json({ message: 'Invalid payment method' });
    if (!user_id || !Array.isArray(cart) || cart.length === 0) {
        return res.status(400).json({ message: "Invalid order data" });
    }

    let conn;

    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // Validate menu ownership and calculate prices on the server.
        let restaurantId;
        for (const item of cart) {
            if (!Number.isSafeInteger(Number(item.id)) || !Number.isSafeInteger(Number(item.qty)) || Number(item.qty) < 1)
                { await conn.rollback(); return res.status(400).json({ message: 'Invalid cart item' }); }
            const [rows] = await conn.query('SELECT restaurant_id, price, discount, is_active FROM menu WHERE id = ?', [item.id]);
            const product = rows[0];
            if (!product || !product.is_active || !product.restaurant_id ||
                (restaurantId && restaurantId !== product.restaurant_id))
                { await conn.rollback(); return res.status(400).json({ message: 'Order must contain available items from one restaurant' }); }
            restaurantId = product.restaurant_id;
            item.finalPrice = Math.round(Number(product.price) * (1 - Number(product.discount || 0) / 100) * 100) / 100;
            item.qty = Number(item.qty);
            total += item.finalPrice * item.qty;
        }
        total = Math.round(total * 100) / 100;
        // 1�,?��� Create invoice (ORDER)
        const invoice = await createInvoice(conn, user_id, new Date(), total, restaurantId);
        const order_id = invoice.invoice_id;

        // 2�,?��� Insert invoice items
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

        // 3�,?��� CASH PAYMENT (IMMEDIATE)
        if (method === "cash") {
            await PaymentCreation(conn, order_id, user_id, new Date(), total, "cash", null);

            await conn.commit();

            return res.status(201).json({
                success: true,
                message: "Cash order placed successfully",
                invoice_id: order_id
            });
        }

        // 4�,?��� ONLINE PAYMENT (RAZORPAY ORDER ONLY)
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

            return res.status(201).json({
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
