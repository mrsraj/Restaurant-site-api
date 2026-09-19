import tableModel from './table-model.js';

const invoiceModel = tableModel({
  table: 'invoice',
  primaryKey: 'invoice_id',
  columns: [
    'invoice_id',
    'customer_id',
    'invoice_date',
    'due_date',
    'total_amount',
    'notes',
    'created_at',
    'order_status',
    'payment_status',
    'restaurant_id',
  ],
});

const createInvoice = async (conn, customer_id, invoice_date, total_amount, restaurantId) => {
  const [result] = await conn.query(
    'INSERT INTO invoice (customer_id, invoice_date, total_amount, restaurant_id) VALUES (?, ?, ?, ?)',
    [customer_id, invoice_date, total_amount, restaurantId],
  );

  return {
    invoice_id: result.insertId,
  };
};

export { createInvoice, invoiceModel };
export default { createInvoice, ...invoiceModel };
