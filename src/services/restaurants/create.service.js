import AppError from '../../utils/app-error.js';
import {
  roleSql,
  roleNames
} from '../../config/roles.js';
import pool from '../../config/db.js';
import bcrypt from 'bcrypt';
export default async (input = {}, context = {}) => {
  if (typeof input.name !== 'string' || !input.name.trim() || input.name.length > 150) throw new AppError(400, {
    message: 'Restaurant name required (maximum 150 characters)'
  });
  const [result] = await pool.query('INSERT INTO restaurants (name) VALUES (?)', [input.name.trim()]);
  return {
    id: result.insertId,
    name: input.name.trim()
  };
};
