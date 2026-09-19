import AppError from '../../utils/app-error.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {
  getUserByUsername
} from '../../models/user.model.js';
export default async (input = {}, context = {}) => {
  const {
    username,
    password
  } = input;
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) throw new AppError(400, {
    message: 'Mobile number and password required'
  });
  try {
    const [user] = await getUserByUsername(username.trim());
    if (!user || !(await bcrypt.compare(password, user.password))) throw new AppError(401, {
      message: 'Invalid mobile number or password'
    });
    if (Number(user.account_active) !== 1) throw new AppError(403, {
      message: 'Your account is inactive. Contact an administrator.'
    });
    if (user.role_id == null || !user.role) throw new AppError(403, {
      message: 'Your account has no assigned role. Contact an administrator to complete account setup.'
    });
    if (Number(user.role_active) !== 1) throw new AppError(403, {
      message: 'Your assigned role is inactive. Contact an administrator.'
    });
    if (!['user', 'super_admin', 'restaurant_admin', 'kitchen'].includes(user.role)) throw new AppError(403, {
      message: 'Account role is not configured'
    });
    if (['restaurant_admin', 'kitchen'].includes(user.role) && !user.restaurant_id) throw new AppError(403, {
      message: 'Restaurant assignment required'
    });
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET required');
    const token = jwt.sign({
      id: user.id
    }, process.env.JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: '10h'
    });
    return {
      token,
      role: user.role,
      role_id: user.role_id,
      user_id: user.id,
      username: user.username,
      restaurant_id: user.restaurant_id
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Login failed:', error.message);
    throw new AppError(500, {
      message: 'Unable to log in'
    });
  }
};
