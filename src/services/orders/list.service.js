import AppError from '../../utils/app-error.js';
import pool from '../../config/db.js';
async function AdminMenuController(input = {}, context = {}) {
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
      WHERE i.restaurant_id = ? AND (? = 0 OR i.order_status IN ('accepted', 'preparing', 'completed'))
      
    `, [context.restaurantId, context.user.role === 'kitchen' ? 1 : 0]);
    const result = Object.values(rows.reduce((acc, row) => {
      if (!acc[row.invoice_id]) {
        acc[row.invoice_id] = {
          username: row.username,
          total_amount: row.total_amount,
          order_status: row.order_status,
          payment_status: row.payment_status,
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
    }, {}));
    return result;
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error(error);
    throw new AppError(500, {
      message: "Database error"
    });
  }
}
export default AdminMenuController;
