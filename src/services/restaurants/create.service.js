const AppError = require('../../utils/app-error');
const {
  roleSql,
  roleNames
} = require("../../config/roles");
const pool = require("../../config/db");
const bcrypt = require('bcrypt');
module.exports = async (input = {}, context = {}) => {
  if (typeof input.name !== 'string' || !input.name.trim() || input.name.length > 150) throw new AppError(400, {
    message: 'Restaurant name required (maximum 150 characters)'
  });
  const [result] = await pool.query('INSERT INTO restaurants (name) VALUES (?)', [input.name.trim()]);
  return {
    id: result.insertId,
    name: input.name.trim()
  };
};
