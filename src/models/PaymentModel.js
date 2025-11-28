const pool = require('../config/db');

exports.PaymentCreation = async (invoice_id, customer_id, payment_date, amount, method, reference_number) => {

    if (!invoice_id || !customer_id || !amount || !method) {
        throw new Error("Required fields are missing");
    }

    const paymentDate = payment_date || new Date();

    const [result] = await pool.query(
        `INSERT INTO payment 
         (invoice_id, customer_id, payment_date, amount, method, reference_number)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            invoice_id,
            customer_id,
            paymentDate,
            amount,
            method,
            reference_number || null
        ]
    );

    return {
        payment_id: result.insertId,
        success: true
    };
};
