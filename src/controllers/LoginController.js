const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getUserByUsername } = require('../models/UserModel');
module.exports = async (req, res) => {
  const { username, password } = req.body;
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password)
    return res.status(400).json({ message: 'Mobile number and password required' });
  try {
    const [user] = await getUserByUsername(username.trim());
    if (!user || !await bcrypt.compare(password, user.password))
      return res.status(401).json({ message: 'Invalid mobile number or password' });
    if (Number(user.account_active) !== 1) return res.status(403).json({ message: 'Your account is inactive. Contact an administrator.' });
    if (user.role_id == null || !user.role) return res.status(403).json({ message: 'Your account has no assigned role. Contact an administrator to complete account setup.' });
    if (Number(user.role_active) !== 1) return res.status(403).json({ message: 'Your assigned role is inactive. Contact an administrator.' });
    if (!['user', 'super_admin', 'restaurant_admin', 'kitchen'].includes(user.role))
      return res.status(403).json({ message: 'Account role is not configured' });
    if (['restaurant_admin', 'kitchen'].includes(user.role) && !user.restaurant_id)
      return res.status(403).json({ message: 'Restaurant assignment required' });
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET required');
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '10h' });
    return res.status(201).json({ token, role: user.role, role_id: user.role_id, user_id: user.id, username: user.username, restaurant_id: user.restaurant_id });
  } catch (error) {
    console.error('Login failed:', error.message);
    return res.status(500).json({ message: 'Unable to log in' });
  }
};
