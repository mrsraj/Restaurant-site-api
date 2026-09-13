const { roleSql } = require('../config/roles');
const router = require('express').Router();
const authenticate = require('../middlewares/authMiddleware');
const roles = require('../middlewares/roleMiddleware');
const pool = require('../config/db');
router.post('/sessions', require('../controllers/LoginController'));
router.post('/users', require('../controllers/UserRegistration'));
router.get('/users/me', authenticate, (req, res) => res.json({ ...req.user, user_id: req.user.id }));
router.get('/users', authenticate, roles('super_admin'), async (req, res) => {
  const [users] = await pool.query('SELECT u.id, u.username, u.email, u.mob_no, u.role_id, u.isActive, u.restaurant_id, ' + roleSql + ' AS role FROM users u LEFT JOIN roles r ON r.role_id = u.role_id');
  res.json(users);
});
router.post('/password-reset-requests', require('../controllers/Password/ForgetPassword'));
router.post('/password-resets', require('../controllers/Password/verifyOtpController'));
module.exports = router;
