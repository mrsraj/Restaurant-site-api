import AppError from '../../utils/app-error.js';
import {
  roleSql,
  roleNames
} from '../../config/roles.js';
import pool from '../../config/db.js';
import bcrypt from 'bcrypt';
export default async (input = {}, context = {}) => {
  const [rows] = context.user.role === 'super_admin' ? await pool.query('SELECT id, name FROM restaurants ORDER BY id') : await pool.query('SELECT id, name FROM restaurants WHERE id = ?', [context.user.restaurant_id]);
  return rows;
};
