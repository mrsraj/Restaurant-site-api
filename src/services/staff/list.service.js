import AppError from '../../utils/app-error.js';
import {
  roleSql,
  roleNames
} from '../../config/roles.js';
import pool from '../../config/db.js';
import bcrypt from 'bcrypt';
export default async (input = {}, context = {}) => {
  const [rows] = context.user.role === 'super_admin' ? await pool.query("SELECT u.id, u.username, u.mob_no, u.role_id, u.isActive, u.restaurant_id, " + roleSql + " AS role FROM users u JOIN roles r ON r.role_id = u.role_id WHERE r.name IN ('manager', 'staff') ORDER BY u.id") : await pool.query("SELECT u.id, u.username, u.mob_no, u.role_id, u.isActive, u.restaurant_id, " + roleSql + " AS role FROM users u JOIN roles r ON r.role_id = u.role_id WHERE u.restaurant_id = ? AND r.name = 'staff' ORDER BY u.id", [context.user.restaurant_id]);
  return rows;
};
