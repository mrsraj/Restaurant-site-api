const pool = require('../config/db');
const bcrypt = require('bcrypt');

const ForgetPassword = async (req, res) => {
    const { password, mob_no } = req.body;

    try {
        // 1. Check if user exists
        const [users] = await pool.query(
            'SELECT id FROM users WHERE mob_no = ?',
            [mob_no]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: 'User not found, please register yourself'
            });
        }

        // 2. Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Update password
        await pool.query(
            'UPDATE users SET password = ? WHERE mob_no = ?',
            [hashedPassword, mob_no]
        );

        return res.status(200).json({
            message: 'Password updated successfully'
        });

    } catch (error) {
        console.error('Forget password error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

module.exports = ForgetPassword;
