const pool = require('../config/db');
const bcrypt = require('bcrypt');
module.exports = async (req, res) => {
  const { username, email, password, mob_no } = req.body;
  if (req.body.role_id !== undefined || (req.body.role && req.body.role !== 'user'))
    return res.status(403).json({ message: 'Staff accounts must be created by an administrator' });
  if (![username, password, mob_no].every(v => typeof v === 'string' && v.trim()) || password.length < 8)
    return res.status(400).json({ message: 'Name, mobile number and a password of at least 8 characters required' });
  try {
    const [roles] = await pool.query("SELECT role_id FROM roles WHERE name = 'users' AND isActive = 1");
    if (roles.length !== 1) return res.status(503).json({ message: 'Customer registration is not configured' });
    const [existing] = await pool.query('SELECT id FROM users WHERE mob_no = ?', [mob_no]);
    if (existing.length) return res.status(409).json({ message: 'Mobile number already registered' });
    await pool.query('INSERT INTO users (username, email, role_id, mob_no, password) VALUES (?, ?, ?, ?, ?)',
      [username, email || null, roles[0].role_id, mob_no, await bcrypt.hash(password, 10)]);
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    return res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({ message: error.code === 'ER_DUP_ENTRY' ? 'Email or mobile number already registered' : 'Registration failed' });
  }
};
