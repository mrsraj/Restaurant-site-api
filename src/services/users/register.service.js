import AppError from '../../utils/app-error.js';
import pool from '../../config/db.js';
import bcrypt from 'bcrypt';
export default async (input = {}, context = {}) => {
  const {
    username,
    email,
    password,
    mob_no
  } = input;
  if (input.role_id !== undefined || input.role && input.role !== 'user') throw new AppError(403, {
    message: 'Staff accounts must be created by an administrator'
  });
  if (![username, password, mob_no].every(v => typeof v === 'string' && v.trim()) || password.length < 8) throw new AppError(400, {
    message: 'Name, mobile number and a password of at least 8 characters required'
  });
  try {
    const [roles] = await pool.query("SELECT role_id FROM roles WHERE name = 'users' AND isActive = 1");
    if (roles.length !== 1) throw new AppError(503, {
      message: 'Customer registration is not configured'
    });
    const [existing] = await pool.query('SELECT id FROM users WHERE mob_no = ?', [mob_no]);
    if (existing.length) throw new AppError(409, {
      message: 'Mobile number already registered'
    });
    await pool.query('INSERT INTO users (username, email, role_id, mob_no, password) VALUES (?, ?, ?, ?, ?)', [username, email || null, roles[0].role_id, mob_no, await bcrypt.hash(password, 10)]);
    return {
      message: 'User registered successfully'
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(error.code === 'ER_DUP_ENTRY' ? 409 : 500, {
      message: error.code === 'ER_DUP_ENTRY' ? 'Email or mobile number already registered' : 'Registration failed'
    });
  }
};
