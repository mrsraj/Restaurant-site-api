import tableModel from './table-model.js';

const paymentModel = tableModel({
  table: 'payment',
  primaryKey: 'payment_id',
  columns: [
    'payment_id',
    'invoice_id',
    'customer_id',
    'payment_date',
    'amount',
    'method',
    'reference_number',
    'created_at',
  ],
});

const PaymentCreation = async (conn, invoice_id, customer_id, payment_date, amount, method, reference_number) => {
  if (!invoice_id || !customer_id || !amount || !method) {
    throw new Error('Required fields are missing');
  }

  const paymentDate = payment_date || new Date();
  const [result] = await conn.query(
    'INSERT INTO payment (invoice_id, customer_id, payment_date, amount, method, reference_number) VALUES (?, ?, ?, ?, ?, ?)',
    [invoice_id, customer_id, paymentDate, amount, method, reference_number || null],
  );

  return {
    payment_id: result.insertId,
    success: true,
  };
};

export { PaymentCreation, paymentModel };
export default { PaymentCreation, ...paymentModel };
