const AppError = require('../../utils/app-error');
const {
  roleSql,
  roleNames
} = require("../../config/roles");
const pool = require("../../config/db");
const bcrypt = require('bcrypt');
module.exports = async (input = {}, context = {}) => {
  const [rows] = context.user.role === 'super_admin' ? await pool.query("SELECT u.id, u.username, u.mob_no, u.role_id, u.isActive, u.restaurant_id, " + roleSql + " AS role FROM users u JOIN roles r ON r.role_id = u.role_id WHERE r.name IN ('manager', 'staff') ORDER BY u.id") : await pool.query("SELECT u.id, u.username, u.mob_no, u.role_id, u.isActive, u.restaurant_id, " + roleSql + " AS role FROM users u JOIN roles r ON r.role_id = u.role_id WHERE u.restaurant_id = ? AND r.name = 'staff' ORDER BY u.id", [context.user.restaurant_id]);
  return rows;
};
