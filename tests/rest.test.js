import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

import app from '../src/app.js';

let server;
let base;

before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
});

after(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
});

test('health route is reachable', async () => {
  const response = await fetch(base + '/api/v1/health');

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('unknown routes return JSON 404', async () => {
  const response = await fetch(base + '/missing-route');

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { message: 'Path does not exist' });
});
