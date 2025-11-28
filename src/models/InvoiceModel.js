const pool = require("../config/db");

exports.createInvoice = async (customer_id, invoice_date, total_amount) => {
  const [result] = await pool.query(
    `INSERT INTO invoice (customer_id, invoice_date, total_amount) VALUES (?, ?, ?)`,
    [customer_id, invoice_date, total_amount]
  );

  return { invoice_id: result.insertId };
};
