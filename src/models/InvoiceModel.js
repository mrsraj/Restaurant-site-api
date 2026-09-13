const pool = require("../config/db");

exports.createInvoice = async (conn,customer_id, invoice_date, total_amount, restaurantId) => {
  const [result] = await conn.query(
    `INSERT INTO invoice (customer_id, invoice_date, total_amount, restaurant_id) VALUES (?, ?, ?, ?)`,
    [customer_id, invoice_date, total_amount, restaurantId]
  );

  return { invoice_id: result.insertId };
};
