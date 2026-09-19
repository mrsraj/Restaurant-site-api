import AppError from '../../utils/app-error.js';
import {
  roleSql
} from '../../config/roles.js';
import pool from '../../config/db.js';
export default async (input = {}, context = {}) => {
  const [users] = await pool.query('SELECT u.id, u.username, u.email, u.mob_no, u.role_id, u.isActive, u.restaurant_id, ' + roleSql + ' AS role FROM users u LEFT JOIN roles r ON r.role_id = u.role_id');
  return users;
};
