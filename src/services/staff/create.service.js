import AppError from '../../utils/app-error.js';
import {
  roleSql,
  roleNames
} from '../../config/roles.js';
import pool from '../../config/db.js';
import bcrypt from 'bcrypt';
export default async (input = {}, context = {}) => {
  const {
    username,
    mob_no,
    password,
    email,
    role
  } = input;
  const allowed = context.user.role === 'super_admin' ? ['restaurant_admin', 'kitchen'] : ['kitchen'];
  if (!allowed.includes(role)) throw new AppError(403, {
    message: 'You cannot create this role'
  });
  const restaurantId = context.user.role === 'super_admin' ? Number(input.restaurant_id) : context.user.restaurant_id;
  if (context.user.role !== 'super_admin' && input.restaurant_id !== undefined && Number(input.restaurant_id) !== Number(restaurantId)) throw new AppError(403, {
    message: 'Access to another restaurant denied'
  });
  if (!Number.isSafeInteger(Number(restaurantId)) || Number(restaurantId) < 1 || ![username, mob_no, password].every(v => typeof v === 'string' && v.trim()) || password.length < 8) throw new AppError(400, {
    message: 'Name, mobile, restaurant and password of at least 8 characters required'
  });
  const [restaurants] = await pool.query('SELECT id FROM restaurants WHERE id = ?', [restaurantId]);
  if (!restaurants.length) throw new AppError(404, {
    message: 'Restaurant not found'
  });
  const [configuredRoles] = await pool.query('SELECT role_id FROM roles WHERE name = ? AND isActive = 1', [roleNames[role]]);
  if (configuredRoles.length !== 1) throw new AppError(400, {
    message: 'Requested role is unavailable'
  });
  if (input.role_id !== undefined && Number(input.role_id) !== configuredRoles[0].role_id) throw new AppError(400, {
    message: 'role_id does not match the requested role'
  });
  const [existing] = await pool.query('SELECT id FROM users WHERE mob_no = ?', [mob_no]);
  if (existing.length) throw new AppError(409, {
    message: 'Mobile number already registered'
  });
  try {
    const [result] = await pool.query('INSERT INTO users (username, mob_no, email, password, role_id, restaurant_id) VALUES (?, ?, ?, ?, ?, ?)', [username, mob_no, email || null, await bcrypt.hash(password, 10), configuredRoles[0].role_id, restaurantId]);
    return {
      id: result.insertId,
      username,
      role,
      role_id: configuredRoles[0].role_id,
      restaurant_id: restaurantId
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error.code === 'ER_DUP_ENTRY') throw new AppError(409, {
      message: 'Mobile number already registered'
    });
    throw error;
  }
};
