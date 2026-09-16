const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function load(file, mocks = {}) {
  const root = path.resolve(__dirname, '../src');
  const [filename, member] = file.split('#');
  const cache = new Map();
  const mockFiles = new Map(Object.entries(mocks).filter(([name]) => name.startsWith('../')).map(([name, value]) => [path.resolve(root, name.slice(3)) + '.js', value]));
  function readModule(absolute) {
    if (mockFiles.has(absolute)) return mockFiles.get(absolute);
    if (cache.has(absolute)) return cache.get(absolute).exports;
    const module = { exports: {} }; cache.set(absolute, module);
    const localRequire = name => {
      if (!name.startsWith('.')) return mocks[name] || require(name);
      let target = path.resolve(path.dirname(absolute), name);
      if (!target.endsWith('.js')) target += '.js';
      return readModule(target);
    };
    vm.runInNewContext(fs.readFileSync(absolute, 'utf8'), { module, exports: module.exports, require: localRequire, process, console }, { filename: absolute });
    if (absolute.includes(path.sep + 'controllers' + path.sep)) {
      for (const key of Object.keys(module.exports)) {
        const handler = module.exports[key];
        module.exports[key] = (req, res, next = error => res.status(error.status || 500).json(error.payload || { message: error.message })) => handler(req, res, next);
      }
    }
    return module.exports;
  }
  const result = readModule(path.join(root, filename));
  return member ? result[member] : result;
}
function response() { return { code: 200, status(n) { this.code = n; return this; }, json(data) { this.body = data; return this; } }; }
test('kitchen cannot use admin-only routes; missing identity is unauthorized', () => {
  const roles = load('middlewares/authorize.middleware.js');
  for (const [user, expected] of [[{role:'kitchen'},403],[undefined,401]]) {
    const res=response(); let passed=false;
    roles('super_admin','restaurant_admin')({user},res,()=>passed=true);
    assert.equal(res.code,expected); assert.equal(passed,false);
  }
});
test('scope rejects forged restaurant selection before a database query', async () => {
  const scope=load('middlewares/restaurant-scope.middleware.js', {'../config/db':{query:async()=>{throw Error('must not query');}}});
  const res=response();
  await scope({user:{role:'restaurant_admin',restaurant_id:2},headers:{'x-restaurant-id':'3'},query:{},body:{}},res,()=>assert.fail());
  assert.equal(res.code,403);
});
test('kitchen scope is derived from its account', async () => {
  let selected;
  const scope=load('middlewares/restaurant-scope.middleware.js', {'../config/db':{query:async(sql,args)=>{selected=args[0];return [[{id:2}]];}}});
  const req={user:{role:'kitchen',restaurant_id:2},headers:{},query:{},body:{}};
  let passed=false;
  await scope(req,response(),()=>passed=true);
  assert.equal(selected,2); assert.equal(req.restaurantId,2); assert.equal(passed,true);
});
test('authentication reloads role from database instead of trusting JWT role', async () => {
  const auth=load('middlewares/auth.middleware.js', {
    jsonwebtoken:{verify:()=>({id:4,role:'super_admin'})},
    '../config/db':{query:async()=>[[{id:4,role:'kitchen',restaurant_id:2}]]}
  });
  const req={headers:{authorization:'Bearer token'}}; let passed=false;
  await auth(req,response(),()=>passed=true);
  assert.equal(req.user.role,'kitchen'); assert.equal(passed,true);
});
test('old tokens without account IDs and deleted users are rejected', async () => {
  for (const decoded of [{username:'old'}, {id:4}]) {
    const auth=load('middlewares/auth.middleware.js', {jsonwebtoken:{verify:()=>decoded},'../config/db':{query:async()=>[[]]}});
    const res=response(); await auth({headers:{authorization:'Bearer token'}},res,()=>assert.fail());
    assert.equal(res.code,401);
  }
});
test('public registration cannot create privileged accounts', async () => {
  const register=load('controllers/users/users.controller.js#register', {'../config/db':{},bcrypt:{}});
  const res=response(); await register({body:{role:'super_admin'}},res); assert.equal(res.code,403);
});
test('kitchen cannot change payment status', async () => {
  const update=load('controllers/orders/orders.controller.js#update',{'../config/db':{}});
  const res=response(); await update({user:{role:'kitchen'},params:{id:1},body:{payment_status:'paid'}},res);
  assert.equal(res.code,403);
});
test('order mutations include restaurant constraint and report missing foreign orders', async () => {
  let query, args;
  const update=load('controllers/orders/orders.controller.js#update',{'../config/db':{query:async(s,a)=>{query=s;args=a;return [[]];}}});
  const res=response();
  await update({user:{role:'kitchen'},restaurantId:2,params:{id:99},body:{order_status:'preparing'}},res);
  assert.match(query,/restaurant_id = \?/); assert.equal(args.at(-1),2); assert.equal(res.code,404);
});
test('restaurant admins cannot create admins or assign kitchen staff elsewhere', async () => {
  const handlers={};
  const router={use(){},get(){},post(route,...fns){handlers[route]=fns.at(-1);}};
  load('routes/staff.routes.js',{
    express:{Router:()=>router}, '../config/db':{}, bcrypt:{},
    '../middlewares/auth.middleware':()=>{}, '../middlewares/authorize.middleware':()=>()=>{}
  });
  for(const body of [{role:'super_admin'}, {role:'restaurant_admin'}, {role:'kitchen',restaurant_id:3}]) {
    const res=response(); await handlers['/']({user:{role:'restaurant_admin',restaurant_id:2},body},res);
    assert.equal(res.code,403);
  }
});

test('payment verification cannot target another customer invoice', async () => {
  const ownInvoice = load('middlewares/invoice-owner.middleware.js', {
    '../config/db': { query: async (sql, args) => {
      assert.match(sql, /customer_id = \?/);
      assert.equal(args[1], 7);
      return [[]];
    } }
  });
  const res = response();
  await ownInvoice({ params: { id: 20 }, user: { id: 7 }, body: {} }, res, error => res.status(error.status).json(error.payload));
  assert.equal(res.code, 404);
});

test('authentication joins role_id and requires active account and active role', async () => {
  let sql;
  const auth = load('middlewares/auth.middleware.js', {
    jsonwebtoken: { verify: () => ({ id: 4 }) },
    '../config/db': { query: async query => { sql = query; return [[]]; } }
  });
  const res = response();
  await auth({ headers: { authorization: 'Bearer token' } }, res, () => assert.fail());
  assert.match(sql, /r.role_id = u.role_id/);
  assert.match(sql, /u.isActive = 1 AND r.isActive = 1/);
  assert.equal(res.code, 401);
});
test('login rejects ambiguous mobile numbers and retrieves account and role status', async () => {
  const model = load('models/user.model.js', { '../config/db': { query: async sql => {
    assert.match(sql, /r.role_id = u.role_id/);
    assert.match(sql, /LEFT JOIN roles/);
    assert.match(sql, /u.isActive AS account_active, r.isActive AS role_active/);
    return [[{ id: 1 }, { id: 2 }]];
  } } });
  assert.equal((await model.getUserByUsername('duplicate')).length, 0);
});
test('registration cannot assign a role_id supplied by the caller', async () => {
  const register = load('controllers/users/users.controller.js#register', { '../config/db': {}, bcrypt: {} });
  const res = response();
  await register({ body: { role_id: 1 } }, res);
  assert.equal(res.code, 403);
});

test('login distinguishes missing roles only after verifying the password', async () => {
  const user = { id: 7, password: 'hash', role_id: null, role: null, account_active: 1, role_active: null };
  for (const validPassword of [false, true]) {
    const login = load('controllers/auth/auth.controller.js#login', {
      '../models/user.model': { getUserByUsername: async () => [user] },
      bcrypt: { compare: async () => validPassword },
      jsonwebtoken: { sign: () => assert.fail('Unassigned account must not get a token') }
    });
    const res = response();
    await login({ body: { username: '123', password: 'password' } }, res);
    assert.equal(res.code, validPassword ? 403 : 401);
    if (validPassword) assert.match(res.body.message, /no assigned role/);
  }
});
test('login denies inactive accounts and inactive roles', async () => {
  for (const status of [{ account_active: 0, role_active: 1 }, { account_active: 1, role_active: 0 }]) {
    const login = load('controllers/auth/auth.controller.js#login', {
      '../models/user.model': { getUserByUsername: async () => [{ id: 7, role_id: 4, role: 'user', password: 'hash', ...status }] },
      bcrypt: { compare: async () => true },
      jsonwebtoken: { sign: () => assert.fail('Inactive account must not get a token') }
    });
    const res = response();
    await login({ body: { username: '123', password: 'password' } }, res);
    assert.equal(res.code, 403);
    assert.match(res.body.message, /inactive/);
  }
});
test('active customer login succeeds and trims mobile-number whitespace', async () => {
  const previous = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'login-test-only';
  try {
    const login = load('controllers/auth/auth.controller.js#login', {
      '../models/user.model': { getUserByUsername: async mobile => {
        assert.equal(mobile, '123');
        return [{ id: 7, role_id: 4, role: 'user', password: 'hash', account_active: 1, role_active: 1 }];
      } },
      bcrypt: { compare: async () => true },
      jsonwebtoken: { sign: () => 'test-token' }
    });
    const res = response();
    await login({ body: { username: ' 123 ', password: 'password' } }, res);
    assert.equal(res.code, 201);
    assert.equal(res.body.role, 'user');
    assert.equal(res.body.token, 'test-token');
  } finally {
    if (previous === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previous;
  }
});

test('reservation service returns data and uses trusted customer and restaurant context', async () => {
  let values;
  const create = load('services/reservations/create.service.js', {
    '../config/db': { query: async (sql, args) => { values = args; return [{ insertId: 21 }]; } }
  });
  const result = await create({
    user_id: 999, restaurant_id: 999, customer_name: 'Test guest', customer_phone: '123',
    number_of_persons: 2, reservation_date: '2026-10-01', reservation_time: '18:00'
  }, { user: { id: 7 }, restaurantId: 2 });
  assert.equal(result.reservation_id, 21);
  assert.equal(values[0], 7);
  assert.equal(values.at(-1), 2);
});
test('order service rolls back and releases its connection for mixed-restaurant carts', async () => {
  let rollbacks = 0, releases = 0;
  const conn = {
    beginTransaction: async () => {},
    query: async (sql, args) => [[{ restaurant_id: args[0], price: 100, discount: 0, is_active: 1 }]],
    rollback: async () => { rollbacks++; },
    release: () => { releases++; },
    commit: async () => assert.fail('Invalid order must not commit')
  };
  const create = load('services/orders/create.service.js', {
    '../config/db': { getConnection: async () => conn },
    '../config/razorpay': {},
    '../models/invoice.model': { createInvoice: async () => assert.fail('Invalid cart must not create an invoice') },
    '../models/invoice-item.model': {},
    '../models/payment.model': {}
  });
  await assert.rejects(create({ method: 'cash', cart: [{ id: 1, qty: 1 }, { id: 2, qty: 1 }] }, { user: { id: 7 } }),
    error => error.status === 400);
  assert.equal(rollbacks, 1);
  assert.equal(releases, 1);
});
test('cash order service calculates totals and commits without an HTTP response object', async () => {
  let total, customer, restaurant, commits = 0, releases = 0;
  const conn = {
    beginTransaction: async () => {},
    query: async () => [[{ restaurant_id: 2, price: 100, discount: 10, is_active: 1 }]],
    rollback: async () => assert.fail('Successful order must not roll back'),
    release: () => { releases++; },
    commit: async () => { commits++; }
  };
  const create = load('services/orders/create.service.js', {
    '../config/db': { getConnection: async () => conn },
    '../config/razorpay': {},
    '../models/invoice.model': { createInvoice: async (connection, userId, date, amount, restaurantId) => {
      customer = userId; total = amount; restaurant = restaurantId; return { invoice_id: 123 };
    } },
    '../models/invoice-item.model': { createInvoiceLine: async () => {} },
    '../models/payment.model': { PaymentCreation: async () => {} }
  });
  const result = await create({ user_id: 999, total: 1, method: 'cash', cart: [{ id: 4, qty: 2, finalPrice: 1 }] }, { user: { id: 7 } });
  assert.equal(result.invoice_id, 123);
  assert.equal(total, 180);
  assert.equal(customer, 7);
  assert.equal(restaurant, 2);
  assert.equal(commits, 1);
  assert.equal(releases, 1);
});
test('upload service validates a missing file and returns provider data without HTTP objects', async () => {
  const create = load('services/uploads/create.service.js', {
    '../integrations/cloudinary': async file => {
      assert.equal(file, 'test-image');
      return { secure_url: 'https://example.invalid/image.png', public_id: 'image' };
    }
  });
  await assert.rejects(create({}, {}), error => error.status === 400);
  const result = await create({}, { file: { path: 'test-image' } });
  assert.equal(result.public_id, 'image');
  assert.equal(result.url, 'https://example.invalid/image.png');
});

test('order workflow allows only the correct role and previous state', async () => {
  const cases = [
    ['restaurant_admin', 'pending', 'accepted', 200],
    ['kitchen', 'accepted', 'preparing', 200],
    ['kitchen', 'preparing', 'completed', 200],
    ['restaurant_admin', 'completed', 'delivered', 200],
    ['kitchen', 'pending', 'accepted', 403],
    ['kitchen', 'completed', 'delivered', 403],
    ['restaurant_admin', 'accepted', 'preparing', 403],
    ['restaurant_admin', 'preparing', 'completed', 403],
    ['restaurant_admin', 'accepted', 'delivered', 409],
    ['kitchen', 'accepted', 'completed', 409],
    ['kitchen', 'pending', 'preparing', 409],
    ['kitchen', 'delivered', 'preparing', 409],
    ['restaurant_admin', 'delivered', 'accepted', 409]
  ];
  for (const [role, current, target, expected] of cases) {
    let writes = 0;
    const update = load('services/orders/update.service.js', { '../config/db': { query: async (sql, args) => {
      if (sql.startsWith('SELECT')) return [[{ order_status: current, payment_status: 'pending' }]];
      writes++;
      assert.match(sql, /restaurant_id = \? AND order_status = \?/);
      assert.equal(args[2], 2);
      assert.equal(args[3], current);
      return [{ affectedRows: 1 }];
    } } });
    const operation = update({ order_status: target }, { user: { role }, params: { id: 12 }, restaurantId: 2 });
    if (expected === 200) { await operation; assert.equal(writes, 1); }
    else { await assert.rejects(operation, e => e.status === expected); assert.equal(writes, 0); }
  }
});
test('stale order transitions return conflict', async () => {
  const update = load('services/orders/update.service.js', { '../config/db': { query: async sql =>
    sql.startsWith('SELECT') ? [[{ order_status: 'accepted', payment_status: 'pending' }]] : [{ affectedRows: 0 }]
  } });
  await assert.rejects(update({ order_status: 'preparing' }, { user: { role: 'kitchen' }, params: { id: 1 }, restaurantId: 2 }), e => e.status === 409);
});
test('kitchen order listing filters out pending, cancelled and delivered tickets in SQL', async () => {
  for (const role of ['kitchen', 'restaurant_admin']) {
    const list = load('services/orders/list.service.js', { '../config/db': { query: async (sql, args) => {
      assert.match(sql, /i.order_status IN \('accepted', 'preparing', 'completed'\)/);
      assert.equal(args[0], 2);
      assert.equal(args[1], role === 'kitchen' ? 1 : 0);
      return [[]];
    } } });
    assert.equal((await list({}, { user: { role }, restaurantId: 2 })).length, 0);
  }
});

test('home reads only the selected restaurant and handles empty content', async () => {
  const get = load('services/home/get.service.js', {
    '../models/restaurant-home.model': { findByRestaurant: async id => { assert.equal(id, 7); return { id, name: 'Restaurant', sections: null }; } },
    '../config/db': { query: async (sql, args) => { assert.match(sql, /restaurant_id = \? AND is_active = 1/); assert.equal(args[0], 7); return [[]]; } }
  });
  const result = await get({}, { restaurantId: 7 });
  assert.equal(result.restaurant.sections.length, 0);
  assert.equal(result.dishes.length, 0);
});
test('home rejects missing restaurants', async () => {
  const get = load('services/home/get.service.js', {
    '../models/restaurant-home.model': { findByRestaurant: async () => null },
    '../config/db': { query: async () => assert.fail('Must not read dishes') }
  });
  await assert.rejects(get({}, { restaurantId: 7 }), error => error.status === 404);
});
