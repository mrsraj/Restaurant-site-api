const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = 'rest-route-test-secret-only';
const writes = [];
const dbPath = require.resolve('../src/config/db');
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: {
  async query(sql, values = []) {
    if (sql.includes('WHERE u.id = ? AND u.isActive = 1 AND r.isActive = 1')) {
      const roles = { 1: 'kitchen', 2: 'restaurant_admin', 3: 'super_admin', 4: 'user' };
      return [[{ id: values[0], username: 'Test', role: roles[values[0]], restaurant_id: 1 }]];
    }
    if (sql.startsWith('SELECT id FROM restaurants')) return [[{ id: 1 }]];
    if (sql.startsWith('SELECT id FROM menu')) return [[{ id: values[0] }]];
    if (sql.startsWith('UPDATE menu') || sql.startsWith('DELETE FROM menu') || sql.startsWith('UPDATE invoice')) {
      writes.push({ sql, values }); return [{ affectedRows: 1 }];
    }
    return [[]];
  }
}};
const { server } = require('../src/app');
let base;
before(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
});
after(async () => {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
});
function headers(id) {
  return { 'Content-Type': 'application/json', Authorization: 'Bearer ' + jwt.sign({ id }, process.env.JWT_SECRET) };
}
test('health and public menu are reachable without unrelated router authorization', async () => {
  assert.equal((await fetch(base + '/api/v1/health')).status, 200);
  const response = await fetch(base + '/api/v1/menu-items');
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).data, []);
});
test('management requests are not intercepted by payment customer permissions', async () => {
  assert.equal((await fetch(base + '/api/v1/restaurants', { headers: headers(3) })).status, 200);
});
test('PATCH updates only supplied menu fields and uses the path ID', async () => {
  const response = await fetch(base + '/api/v1/menu-items/7', {
    method: 'PATCH', headers: headers(2), body: JSON.stringify({ id: 99, price: 120 })
  });
  assert.equal(response.status, 200);
  const write = writes.at(-1);
  assert.equal(write.sql, 'UPDATE menu SET price = ? WHERE id = ? AND restaurant_id = ?');
  assert.deepEqual(write.values, [120, '7', 1]);
});
test('kitchen is forbidden from menu mutation but can update an order', async () => {
  assert.equal((await fetch(base + '/api/v1/menu-items/7', {
    method: 'PATCH', headers: headers(1), body: JSON.stringify({ price: 120 })
  })).status, 403);
  assert.equal((await fetch(base + '/api/v1/orders/7', {
    method: 'PATCH', headers: headers(1), body: JSON.stringify({ order_status: 'accepted' })
  })).status, 200);
});
test('DELETE returns 204 with no response body', async () => {
  const response = await fetch(base + '/api/v1/menu-items/7', { method: 'DELETE', headers: headers(2) });
  assert.equal(response.status, 204);
  assert.equal(await response.text(), '');
});
test('malformed JSON and invalid path IDs return 400', async () => {
  assert.equal((await fetch(base + '/api/v1/sessions', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{'
  })).status, 400);
  assert.equal((await fetch(base + '/api/v1/menu-items/not-an-id')).status, 400);
});
test('CORS allows PATCH and legacy menu routes are removed', async () => {
  const response = await fetch(base + '/api/v1/menu-items/7', {
    method: 'OPTIONS', headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'PATCH' }
  });
  assert.match(response.headers.get('access-control-allow-methods'), /PATCH/);
  assert.equal((await fetch(base + '/api/menu')).status, 404);
});

test('missing request body is a client error, not an internal server error', async () => {
  assert.equal((await fetch(base + '/api/v1/sessions', { method: 'POST' })).status, 400);
});
