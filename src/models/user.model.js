import pool from '../config/db.js';
import { roleSql } from '../config/roles.js';
import tableModel from './table-model.js';

const userModel = tableModel({
  table: 'users',
  primaryKey: 'id',
  columns: [
    'id',
    'username',
    'email',
    'password',
    'created_at',
    'mob_no',
    'otp',
    'otp_expiry',
    'restaurant_id',
    'isActive',
    'role_id',
  ],
});

const getUserByUsername = async (username) => {
  const [rows] = await pool.query(
    'SELECT u.id, u.username, u.password, u.restaurant_id, u.role_id, u.isActive AS account_active, r.isActive AS role_active, ' +
      roleSql +
      ' AS role FROM users u LEFT JOIN roles r ON r.role_id = u.role_id WHERE u.mob_no = ?',
    [username],
  );

  return rows.length === 1 ? rows : [];
};

export { getUserByUsername, userModel };
export default { getUserByUsername, ...userModel };
