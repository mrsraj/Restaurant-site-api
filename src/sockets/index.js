const socketIO = require('socket.io');
const authenticate = require('../middlewares/auth.middleware');
const scope = require('../middlewares/restaurant-scope.middleware');
const pool = require('../config/db');
const events = require('./order-events');
function middleware(handler, req) {
  return new Promise((resolve, reject) => {
    const res = { status() { return this; }, json() { reject(new Error('Socket access denied')); } };
    Promise.resolve(handler(req, res, error => error ? reject(error) : resolve())).catch(reject);
  });
}
async function identity(socket) {
  const auth = socket.handshake.auth || {};
  const req = { headers: { authorization: 'Bearer ' + (auth.token || '') }, query: {}, body: {} };
  if (auth.restaurantId !== undefined) req.headers['x-restaurant-id'] = auth.restaurantId;
  await middleware(authenticate, req);
  if (req.user.role !== 'user') await middleware(scope, req);
  return { room: req.user.role === 'user' ? 'customer:' + req.user.id : 'restaurant:' + req.restaurantId, role: req.user.role };
}
module.exports = server => {
  const io = socketIO(server, { cors: { origin: '*' } });
  io.use(async (socket, next) => {
    try { socket.data.identity = await identity(socket); next(); }
    catch { next(new Error('Authentication or restaurant access denied')); }
  });
  io.on('connection', socket => { socket.join(socket.data.identity.room); });
  const notify = async invoiceId => {
    try {
      const [rows] = await pool.query('SELECT restaurant_id, customer_id, order_status FROM invoice WHERE invoice_id = ?', [invoiceId]);
      const order = rows[0];
      if (!order) return;
      const rooms = ['restaurant:' + order.restaurant_id, 'customer:' + order.customer_id];
      const sockets = await io.in(rooms).fetchSockets();
      await Promise.all(sockets.map(async socket => {
        try {
          // Recheck expiry, active account, role and assignment before every notification.
          const current = await identity(socket);
          if (current.room !== socket.data.identity.room || current.role !== socket.data.identity.role) return socket.disconnect(true);
          if (current.role === 'kitchen' && order.order_status === 'pending') return;
          socket.emit('orders:changed');
        } catch { socket.disconnect(true); }
      }));
    } catch (error) { console.error('Order notification failed:', error.message); }
  };
  events.on('changed', notify);
  server.on('close', () => events.off('changed', notify));
  return io;
};
