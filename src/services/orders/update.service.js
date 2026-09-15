const orderEvents = require('../../sockets/order-events');
﻿const AppError = require('../../utils/app-error');
const pool = require('../../config/db');
module.exports = async (input = {}, context = {}) => {
  const { order_status, payment_status } = input;
  const id = context.params.id;
  const kitchen = context.user.role === 'kitchen';
  const admin = ['super_admin', 'restaurant_admin'].includes(context.user.role);
  if (!kitchen && !admin) throw new AppError(403, { message: 'Access denied' });
  if (order_status !== undefined && payment_status !== undefined)
    throw new AppError(400, { message: 'Update one status at a time' });
  if (!id) throw new AppError(400, { message: 'Order ID required' });
  if (payment_status !== undefined && !admin)
    throw new AppError(403, { message: 'Kitchen staff cannot change payments' });
  const transitions = kitchen
    ? { preparing: ['accepted'], completed: ['preparing'] }
    : { accepted: ['pending'], delivered: ['completed'], cancelled: ['pending', 'accepted', 'preparing', 'completed'] };
  if (order_status !== undefined && !Object.hasOwn(transitions, order_status))
    throw new AppError(403, { message: kitchen ? 'Kitchen can only mark orders preparing or completed' : 'Administrators can accept, cancel, or deliver completed orders' });
  if (payment_status !== undefined && !['paid', 'unpaid'].includes(payment_status))
    throw new AppError(400, { message: 'Invalid payment status' });
  if (order_status === undefined && payment_status === undefined)
    throw new AppError(400, { message: 'No status provided' });
  const [rows] = await pool.query('SELECT order_status, payment_status FROM invoice WHERE invoice_id = ? AND restaurant_id = ?', [id, context.restaurantId]);
  const order = rows[0];
  if (!order) throw new AppError(404, { message: 'Order not found' });
  if (order_status !== undefined) {
    if (!transitions[order_status].includes(order.order_status))
      throw new AppError(409, { message: 'Order cannot move from ' + order.order_status + ' to ' + order_status });
    if (order_status === 'cancelled' && order.payment_status === 'paid')
      throw new AppError(409, { message: 'Paid orders cannot be cancelled here' });
    const [result] = await pool.query(
      'UPDATE invoice SET order_status = ? WHERE invoice_id = ? AND restaurant_id = ? AND order_status = ? AND payment_status <=> ?',
      [order_status, id, context.restaurantId, order.order_status, order.payment_status]);
    if (!result.affectedRows) throw new AppError(409, { message: 'Order changed. Refresh and try again.' });
  } else {
    await pool.query('UPDATE invoice SET payment_status = ? WHERE invoice_id = ? AND restaurant_id = ?', [payment_status, id, context.restaurantId]);
  }
  orderEvents.emit('changed', id);
  return { message: 'Status updated successfully' };
};
