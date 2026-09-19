const roleNames = Object.freeze({
  super_admin: 'admin',
  restaurant_admin: 'manager',
  kitchen: 'staff',
  user: 'users',
});

const roleSql =
  "CASE r.name WHEN 'admin' THEN 'super_admin' WHEN 'manager' THEN 'restaurant_admin' WHEN 'staff' THEN 'kitchen' WHEN 'users' THEN 'user' ELSE NULL END";

export { roleNames, roleSql };
