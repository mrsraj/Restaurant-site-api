const pool = require('../../config/db');
const bcrypt = require('bcrypt');
const sendMail = require('../../Utility/sendMail'); // your Nodemailer function

const ForgetPassword = async (req, res) => {
    const { mob_no } = req.body;

    if (!mob_no?.trim()) {
        return res.status(400).json({ message: "Mobile number is required" });
    }

    const cleanMobNo = mob_no.trim();

    try {
        // 1. Check if user exists
        const [users] = await pool.query(
            'SELECT id, email FROM users WHERE mob_no = ?',
            [cleanMobNo]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: 'User not found, please register yourself'
            });
        }

        const user = users[0];

        // 2. Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // valid 5 minutes

        // 3. Save OTP and expiry in database
        // Assuming your table has otp and otp_expiry columns
        await pool.query(
            'UPDATE users SET otp = ?, otp_expiry = ? WHERE id = ?',
            [otp, otpExpiry, user.id]
        );

        // 4. Send OTP via email
        await sendMail(
            user.email,
            "Your OTP Code",
            `
        <h2>Password Reset OTP</h2>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>This OTP is valid for 5 minutes.</p>
      `
        );

        return res.status(200).json({
            message: 'OTP has been sent to your registered email',
        });

    } catch (error) {
        console.error('Forget password error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

module.exports = ForgetPassword;
