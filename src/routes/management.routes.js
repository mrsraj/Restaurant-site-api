const { roleSql, roleNames } = require('../config/roles');
const router = require('express').Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const authenticate = require('../middlewares/authMiddleware');
const roles = require('../middlewares/roleMiddleware');
router.use(['/restaurants', '/staff'], authenticate, roles('super_admin', 'restaurant_admin'));
router.get('/restaurants', async (req, res) => {
  const [rows] = req.user.role === 'super_admin'
    ? await pool.query('SELECT id, name FROM restaurants ORDER BY id')
    : await pool.query('SELECT id, name FROM restaurants WHERE id = ?', [req.user.restaurant_id]);
  res.json(rows);
});
router.post('/restaurants', roles('super_admin'), async (req, res) => {
  if (typeof req.body.name !== 'string' || !req.body.name.trim() || req.body.name.length > 150)
    return res.status(400).json({ message: 'Restaurant name required (maximum 150 characters)' });
  const [result] = await pool.query('INSERT INTO restaurants (name) VALUES (?)', [req.body.name.trim()]);
  res.status(201).json({ id: result.insertId, name: req.body.name.trim() });
});
router.get('/staff', async (req, res) => {
  const [rows] = req.user.role === 'super_admin'
    ? await pool.query("SELECT u.id, u.username, u.mob_no, u.role_id, u.isActive, u.restaurant_id, " + roleSql + " AS role FROM users u JOIN roles r ON r.role_id = u.role_id WHERE r.name IN ('manager', 'staff') ORDER BY u.id")
    : await pool.query("SELECT u.id, u.username, u.mob_no, u.role_id, u.isActive, u.restaurant_id, " + roleSql + " AS role FROM users u JOIN roles r ON r.role_id = u.role_id WHERE u.restaurant_id = ? AND r.name = 'staff' ORDER BY u.id", [req.user.restaurant_id]);
  res.json(rows);
});
router.post('/staff', async (req, res) => {
  const { username, mob_no, password, email, role } = req.body;
  const allowed = req.user.role === 'super_admin' ? ['restaurant_admin', 'kitchen'] : ['kitchen'];
  if (!allowed.includes(role)) return res.status(403).json({ message: 'You cannot create this role' });
  const restaurantId = req.user.role === 'super_admin' ? Number(req.body.restaurant_id) : req.user.restaurant_id;
  if (req.user.role !== 'super_admin' && req.body.restaurant_id !== undefined && Number(req.body.restaurant_id) !== Number(restaurantId))
    return res.status(403).json({ message: 'Access to another restaurant denied' });
  if (!Number.isSafeInteger(Number(restaurantId)) || Number(restaurantId) < 1 ||
      ![username, mob_no, password].every(v => typeof v === 'string' && v.trim()) || password.length < 8)
    return res.status(400).json({ message: 'Name, mobile, restaurant and password of at least 8 characters required' });
  const [restaurants] = await pool.query('SELECT id FROM restaurants WHERE id = ?', [restaurantId]);
  if (!restaurants.length) return res.status(404).json({ message: 'Restaurant not found' });
  const [configuredRoles] = await pool.query('SELECT role_id FROM roles WHERE name = ? AND isActive = 1', [roleNames[role]]);
  if (configuredRoles.length !== 1) return res.status(400).json({ message: 'Requested role is unavailable' });
  if (req.body.role_id !== undefined && Number(req.body.role_id) !== configuredRoles[0].role_id)
    return res.status(400).json({ message: 'role_id does not match the requested role' });
  const [existing] = await pool.query('SELECT id FROM users WHERE mob_no = ?', [mob_no]);
  if (existing.length) return res.status(409).json({ message: 'Mobile number already registered' });
  try {
    const [result] = await pool.query('INSERT INTO users (username, mob_no, email, password, role_id, restaurant_id) VALUES (?, ?, ?, ?, ?, ?)',
      [username, mob_no, email || null, await bcrypt.hash(password, 10), configuredRoles[0].role_id, restaurantId]);
    res.status(201).json({ id: result.insertId, username, role, role_id: configuredRoles[0].role_id, restaurant_id: restaurantId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Mobile number already registered' });
    throw error;
  }
});
module.exports = router;
