const pool = require('../../config/db');
const bcrypt = require('bcrypt');

const VerifyOtpAndResetPassword = async (req, res) => {
    const { mob_no, otp, password } = req.body;

    // 1️⃣ Basic validation
    if (!mob_no?.trim()) {
        return res.status(400).json({ message: "Mobile number is required" });
    }

    if (!otp?.trim()) {
        return res.status(400).json({ message: "OTP is required" });
    }

    if (!password?.trim()) {
        return res.status(400).json({ message: "Password is required" });
    }

    if (password.trim().length < 6) {
        return res.status(400).json({
            message: "Password must be at least 6 characters long"
        });
    }

    const cleanMobNo = mob_no.trim();
    const cleanOtp = otp.trim();
    const cleanPassword = password.trim();

    try {
        // 2️⃣ Find user with OTP
        const [users] = await pool.query(
            `SELECT id, otp, otp_expiry 
       FROM users 
       WHERE mob_no = ?`,
            [cleanMobNo]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = users[0];

        // 3️⃣ Check OTP match
        if (!user.otp || user.otp !== cleanOtp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // 4️⃣ Check OTP expiry
        if (new Date(user.otp_expiry) < new Date()) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        // 5️⃣ Hash new password
        const hashedPassword = await bcrypt.hash(cleanPassword, 10);

        // 6️⃣ Update password & clear OTP
        await pool.query(
            `UPDATE users 
       SET password = ?, otp = NULL, otp_expiry = NULL 
       WHERE id = ?`,
            [hashedPassword, user.id]
        );

        return res.status(200).json({
            message: "Password reset successfully"
        });

    } catch (error) {
        console.error("Verify OTP error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = VerifyOtpAndResetPassword;
