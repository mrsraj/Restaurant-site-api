require('dotenv').config();
const pool = require('../src/config/db');
async function main() {
  const mobile = process.argv[2];
  if (!mobile) throw new Error('Usage: node scripts/bootstrap-super-admin.js <existing-account-mobile>');
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [roles] = await conn.query("SELECT role_id FROM roles WHERE name = 'admin' AND isActive = 1 FOR UPDATE");
    if (roles.length !== 1) throw new Error('One active admin role must exist');
    const [existing] = await conn.query('SELECT id FROM users WHERE role_id = ? LIMIT 1', [roles[0].role_id]);
    if (existing.length) throw new Error('A super admin already exists; bootstrap refused');
    const [users] = await conn.query('SELECT id FROM users WHERE mob_no = ? AND isActive = 1 FOR UPDATE', [mobile]);
    if (users.length !== 1) throw new Error('Mobile number must identify exactly one active account');
    await conn.query('UPDATE users SET role_id = ?, restaurant_id = NULL WHERE id = ?', [roles[0].role_id, users[0].id]);
    await conn.commit();
    console.log('Super admin configured. Log in again.');
  } catch (error) { await conn.rollback(); throw error; }
  finally { conn.release(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => pool.end());
