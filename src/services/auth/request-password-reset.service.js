import AppError from '../../utils/app-error.js';
import pool from '../../config/db.js';
import bcrypt from 'bcrypt';
import sendMail from '../../integrations/mail.js';
const ForgetPassword = async (input = {}, context = {}) => {
  const {
    mob_no
  } = input;
  if (!mob_no?.trim()) {
    throw new AppError(400, {
      message: "Mobile number is required"
    });
  }
  const cleanMobNo = mob_no.trim();
  try {
    const [users] = await pool.query('SELECT id, email FROM users WHERE mob_no = ?', [cleanMobNo]);
    if (users.length === 0) {
      throw new AppError(404, {
        message: 'User not found, please register yourself'
      });
    }
    const user = users[0];
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await pool.query('UPDATE users SET otp = ?, otp_expiry = ? WHERE id = ?', [otp, otpExpiry, user.id]);
    await sendMail(user.email, "Your OTP Code", `
        <h2>Password Reset OTP</h2>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>This OTP is valid for 5 minutes.</p>
      `);
    return {
      message: 'OTP has been sent to your registered email'
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Forget password error:', error);
    throw new AppError(500, {
      message: 'Internal server error'
    });
  }
};
export default ForgetPassword;
