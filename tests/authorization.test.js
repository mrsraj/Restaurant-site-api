const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function load(file, mocks = {}) {
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src', file), 'utf8'),
    { module, exports: module.exports, require: name => mocks[name] || (name.startsWith('.') ? require(path.resolve(path.dirname(path.join(__dirname, '../src', file)), name)) : require(name)), process, console });
  return module.exports;
}
function response() { return { code: 200, status(n) { this.code = n; return this; }, json(data) { this.body = data; return this; } }; }
test('kitchen cannot use admin-only routes; missing identity is unauthorized', () => {
  const roles = load('middlewares/roleMiddleware.js');
  for (const [user, expected] of [[{role:'kitchen'},403],[undefined,401]]) {
    const res=response(); let passed=false;
    roles('super_admin','restaurant_admin')({user},res,()=>passed=true);
    assert.equal(res.code,expected); assert.equal(passed,false);
  }
});
test('scope rejects forged restaurant selection before a database query', async () => {
  const scope=load('middlewares/restaurantScope.js', {'../config/db':{query:async()=>{throw Error('must not query');}}});
  const res=response();
  await scope({user:{role:'restaurant_admin',restaurant_id:2},headers:{'x-restaurant-id':'3'},query:{},body:{}},res,()=>assert.fail());
  assert.equal(res.code,403);
});
test('kitchen scope is derived from its account', async () => {
  let selected;
  const scope=load('middlewares/restaurantScope.js', {'../config/db':{query:async(sql,args)=>{selected=args[0];return [[{id:2}]];}}});
  const req={user:{role:'kitchen',restaurant_id:2},headers:{},query:{},body:{}};
  let passed=false;
  await scope(req,response(),()=>passed=true);
  assert.equal(selected,2); assert.equal(req.restaurantId,2); assert.equal(passed,true);
});
test('authentication reloads role from database instead of trusting JWT role', async () => {
  const auth=load('middlewares/authMiddleware.js', {
    jsonwebtoken:{verify:()=>({id:4,role:'super_admin'})},
    '../config/db':{query:async()=>[[{id:4,role:'kitchen',restaurant_id:2}]]}
  });
  const req={headers:{authorization:'Bearer token'}}; let passed=false;
  await auth(req,response(),()=>passed=true);
  assert.equal(req.user.role,'kitchen'); assert.equal(passed,true);
});
test('old tokens without account IDs and deleted users are rejected', async () => {
  for (const decoded of [{username:'old'}, {id:4}]) {
    const auth=load('middlewares/authMiddleware.js', {jsonwebtoken:{verify:()=>decoded},'../config/db':{query:async()=>[[]]}});
    const res=response(); await auth({headers:{authorization:'Bearer token'}},res,()=>assert.fail());
    assert.equal(res.code,401);
  }
});
test('public registration cannot create privileged accounts', async () => {
  const register=load('controllers/UserRegistration.js', {'../config/db':{},bcrypt:{}});
  const res=response(); await register({body:{role:'super_admin'}},res); assert.equal(res.code,403);
});
test('kitchen cannot change payment status', async () => {
  const update=load('controllers/AdminMenuStatusUpdate.js',{'../config/db':{}});
  const res=response(); await update({user:{role:'kitchen'},params:{id:1},body:{payment_status:'paid'}},res);
  assert.equal(res.code,403);
});
test('order mutations include restaurant constraint and report missing foreign orders', async () => {
  let query, args;
  const update=load('controllers/AdminMenuStatusUpdate.js',{'../config/db':{query:async(s,a)=>{query=s;args=a;return [{affectedRows:0}];}}});
  const res=response();
  await update({user:{role:'kitchen'},restaurantId:2,params:{id:99},body:{order_status:'accepted'}},res);
  assert.match(query,/restaurant_id = \?/); assert.equal(args.at(-1),2); assert.equal(res.code,404);
});
test('restaurant admins cannot create admins or assign kitchen staff elsewhere', async () => {
  const handlers={};
  const router={use(){},get(){},post(route,...fns){handlers[route]=fns.at(-1);}};
  load('routes/management.routes.js',{
    express:{Router:()=>router}, '../config/db':{}, bcrypt:{},
    '../middlewares/authMiddleware':()=>{}, '../middlewares/roleMiddleware':()=>()=>{}
  });
  for(const body of [{role:'super_admin'}, {role:'restaurant_admin'}, {role:'kitchen',restaurant_id:3}]) {
    const res=response(); await handlers['/staff']({user:{role:'restaurant_admin',restaurant_id:2},body},res);
    assert.equal(res.code,403);
  }
});

test('payment verification cannot target another customer invoice', async () => {
  const handlers = {};
  const router = { use() {}, patch() {}, post(route, ...fns) { handlers[route] = fns; } };
  const route = load('routes/payment.router.js', {
    express: { Router: () => router },
    '../config/db': { query: async (sql, args) => {
      assert.match(sql, /customer_id = \?/);
      assert.equal(args[1], 7);
      return [[]];
    } },
    '../middlewares/authMiddleware': () => {},
    '../middlewares/roleMiddleware': () => () => {},
    '../controllers/Payment/PaymentController': () => {},
    '../controllers/Payment/VerifyPaymentController': () => {},
    '../controllers/Payment/UpdatePaymentFail': () => {}
  });
  const res = response();
  await handlers['/orders/:id/payment-verifications'][2]({ params: { id: 20 }, user: { id: 7 }, body: { invoice_id: 20, customer_id: 8 } }, res, () => assert.fail());
  assert.equal(res.code, 404);
});

test('authentication joins role_id and requires active account and active role', async () => {
  let sql;
  const auth = load('middlewares/authMiddleware.js', {
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
  const model = load('models/UserModel.js', { '../config/db': { query: async sql => {
    assert.match(sql, /r.role_id = u.role_id/);
    assert.match(sql, /LEFT JOIN roles/);
    assert.match(sql, /u.isActive AS account_active, r.isActive AS role_active/);
    return [[{ id: 1 }, { id: 2 }]];
  } } });
  assert.equal((await model.getUserByUsername('duplicate')).length, 0);
});
test('registration cannot assign a role_id supplied by the caller', async () => {
  const register = load('controllers/UserRegistration.js', { '../config/db': {}, bcrypt: {} });
  const res = response();
  await register({ body: { role_id: 1 } }, res);
  assert.equal(res.code, 403);
});

test('login distinguishes missing roles only after verifying the password', async () => {
  const user = { id: 7, password: 'hash', role_id: null, role: null, account_active: 1, role_active: null };
  for (const validPassword of [false, true]) {
    const login = load('controllers/LoginController.js', {
      '../models/UserModel': { getUserByUsername: async () => [user] },
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
    const login = load('controllers/LoginController.js', {
      '../models/UserModel': { getUserByUsername: async () => [{ id: 7, role_id: 4, role: 'user', password: 'hash', ...status }] },
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
    const login = load('controllers/LoginController.js', {
      '../models/UserModel': { getUserByUsername: async mobile => {
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
