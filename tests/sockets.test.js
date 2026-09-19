import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

import orderEvents from '../src/sockets/order-events.js';
import initializeSockets from '../src/sockets/index.js';

test('orderEvents is an event emitter', async () => {
  const payload = await new Promise((resolve) => {
    orderEvents.once('changed', resolve);
    orderEvents.emit('changed', 10);
  });

  assert.equal(payload, 10);
});

test('socket initializer attaches and returns an io server', async () => {
  const server = http.createServer();
  const io = initializeSockets(server);

  assert.equal(typeof io.close, 'function');

  await new Promise((resolve) => io.close(resolve));
});
