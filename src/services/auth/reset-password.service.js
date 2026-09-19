import AppError from '../../utils/app-error.js';
import pool from '../../config/db.js';
import bcrypt from 'bcrypt';
const VerifyOtpAndResetPassword = async (input = {}, context = {}) => {
  const {
    mob_no,
    otp,
    password
  } = input;
  if (!mob_no?.trim()) {
    throw new AppError(400, {
      message: "Mobile number is required"
    });
  }
  if (!otp?.trim()) {
    throw new AppError(400, {
      message: "OTP is required"
    });
  }
  if (!password?.trim()) {
    throw new AppError(400, {
      message: "Password is required"
    });
  }
  if (password.trim().length < 6) {
    throw new AppError(400, {
      message: "Password must be at least 6 characters long"
    });
  }
  const cleanMobNo = mob_no.trim();
  const cleanOtp = otp.trim();
  const cleanPassword = password.trim();
  try {
    const [users] = await pool.query(`SELECT id, otp, otp_expiry 
       FROM users 
       WHERE mob_no = ?`, [cleanMobNo]);
    if (users.length === 0) {
      throw new AppError(404, {
        message: "User not found"
      });
    }
    const user = users[0];
    if (!user.otp || user.otp !== cleanOtp) {
      throw new AppError(400, {
        message: "Invalid OTP"
      });
    }
    if (new Date(user.otp_expiry) < new Date()) {
      throw new AppError(400, {
        message: "OTP has expired"
      });
    }
    const hashedPassword = await bcrypt.hash(cleanPassword, 10);
    await pool.query(`UPDATE users 
       SET password = ?, otp = NULL, otp_expiry = NULL 
       WHERE id = ?`, [hashedPassword, user.id]);
    return {
      message: "Password reset successfully"
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Verify OTP error:", error);
    throw new AppError(500, {
      message: "Internal server error"
    });
  }
};
export default VerifyOtpAndResetPassword;
