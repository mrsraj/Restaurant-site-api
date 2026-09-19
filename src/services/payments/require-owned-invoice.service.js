import pool from '../../config/db.js';
import AppError from '../../utils/app-error.js';
export default async (id, userId) => {
  const [rows] = await pool.query('SELECT invoice_id FROM invoice WHERE invoice_id = ? AND customer_id = ?', [id || null, userId]);
  if (!rows.length) throw new AppError(404, { message: 'Invoice not found' });
  return rows[0];
};
