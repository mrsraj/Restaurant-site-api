const AppError = require('../../utils/app-error');
const {
  roleSql,
  roleNames
} = require("../../config/roles");
const pool = require("../../config/db");
const bcrypt = require('bcrypt');
module.exports = async (input = {}, context = {}) => {
  const [rows] = context.user.role === 'super_admin' ? await pool.query('SELECT id, name FROM restaurants ORDER BY id') : await pool.query('SELECT id, name FROM restaurants WHERE id = ?', [context.user.restaurant_id]);
  return rows;
};
