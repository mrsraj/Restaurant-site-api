import { test } from 'node:test';
import assert from 'node:assert/strict';

import authorize from '../src/middlewares/authorize.middleware.js';
import AppError from '../src/utils/app-error.js';

const response = () => ({
  code: 200,
  body: null,
  status(statusCode) {
    this.code = statusCode;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

test('authorize rejects missing identity and disallowed roles', () => {
  for (const [user, expected] of [
    [undefined, 401],
    [{ role: 'kitchen' }, 403],
  ]) {
    const res = response();
    let passed = false;

    authorize('super_admin', 'restaurant_admin')({ user }, res, () => {
      passed = true;
    });

    assert.equal(res.code, expected);
    assert.equal(passed, false);
  }
});

test('authorize allows permitted roles', () => {
  const res = response();
  let passed = false;

  authorize('kitchen')({ user: { role: 'kitchen' } }, res, () => {
    passed = true;
  });

  assert.equal(res.code, 200);
  assert.equal(passed, true);
});

test('AppError keeps status and payload for controller errors', () => {
  const error = new AppError(404, { message: 'Missing' });

  assert.equal(error.status, 404);
  assert.deepEqual(error.payload, { message: 'Missing' });
});
