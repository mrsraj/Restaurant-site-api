const { test } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
function setup() {
  const events = new EventEmitter(), server = new EventEmitter();
  const accounts = { admin: { id: 1, role: 'restaurant_admin', restaurant_id: 1 }, kitchen: { id: 2, role: 'kitchen', restaurant_id: 1 }, other: { id: 3, role: 'kitchen', restaurant_id: 2 }, customer: { id: 4, role: 'user' }, stranger: { id: 5, role: 'user' } };
  const order = { restaurant_id: 1, customer_id: 4, order_status: 'pending' };
  const sockets = [];
  const io = { use(fn) { this.auth = fn; }, on(name, fn) { this.connected = fn; }, in(rooms) { return { fetchSockets: async () => sockets.filter(s => rooms.includes(s.room) && !s.disconnected) }; } };
  const mocks = {
    'socket.io': () => io,
    '../config/db': { query: async () => [[order]] },
    './order-events': events,
    '../middlewares/auth.middleware': (req, res, next) => { const user = accounts[req.headers.authorization.slice(7)]; if (!user) return res.status(401).json({}); req.user = user; next(); },
    '../middlewares/restaurant-scope.middleware': (req, res, next) => { if (req.headers['x-restaurant-id'] !== undefined && Number(req.headers['x-restaurant-id']) !== req.user.restaurant_id) return res.status(403).json({}); req.restaurantId = req.user.restaurant_id; next(); }
  };
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/sockets/index.js'), 'utf8'), { module, require: n => mocks[n], console });
  module.exports(server);
  async function connect(token, restaurantId) {
    const socket = { handshake: { auth: { token, restaurantId } }, data: {}, messages: [], join(room) { this.room = room; }, emit(event, payload) { this.messages.push([event, payload]); }, disconnect() { this.disconnected = true; } };
    await new Promise((resolve, reject) => io.auth(socket, e => e ? reject(e) : resolve()));
    io.connected(socket); sockets.push(socket); return socket;
  }
  return { connect, accounts, order, server, events, notify: () => events.listeners('changed')[0](10) };
}
test('socket rejects missing identity and forged restaurant selection', async () => {
  const s = setup();
  await assert.rejects(s.connect('invalid'));
  await assert.rejects(s.connect('kitchen', 2));
});
test('order notifications isolate restaurants and customers and hide pending from kitchen', async () => {
  const s = setup();
  const admin = await s.connect('admin'), kitchen = await s.connect('kitchen'), other = await s.connect('other'), customer = await s.connect('customer'), stranger = await s.connect('stranger');
  await s.notify();
  assert.equal(admin.messages.length, 1); assert.equal(customer.messages.length, 1);
  assert.equal(kitchen.messages.length, 0); assert.equal(other.messages.length, 0); assert.equal(stranger.messages.length, 0);
  for (const status of ['accepted', 'preparing', 'completed', 'delivered', 'cancelled']) { s.order.order_status = status; await s.notify(); }
  assert.equal(kitchen.messages.length, 5); assert.equal(other.messages.length, 0);
  assert.deepEqual(kitchen.messages[0], ['orders:changed', undefined]);
});
test('socket revalidates revoked accounts and changed assignments before notification', async () => {
  const s = setup(); const admin = await s.connect('admin'), kitchen = await s.connect('kitchen');
  delete s.accounts.admin; s.accounts.kitchen.restaurant_id = 2;
  await s.notify();
  assert.equal(admin.disconnected, true); assert.equal(kitchen.disconnected, true);
  assert.equal(admin.messages.length, 0); assert.equal(kitchen.messages.length, 0);
  s.server.emit('close'); assert.equal(s.events.listenerCount('changed'), 0);
});
