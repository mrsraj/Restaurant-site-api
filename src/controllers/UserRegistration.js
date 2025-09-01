const pool = require('../config/db');
const bcrypt = require('bcrypt');

const UserRegistration = async (req, res) => {
    const { username, email, password,role } = req.body;
   console.log("Call register function");
   
    try {
        // 1. Check if user already exists
        const [existingUser] = await pool.query(
            'SELECT * FROM users WHERE email = ? OR username = ?',[email, username]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists with this email or username' });
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Insert user
        await pool.query(
            'INSERT INTO users (username, email,role, password) VALUES (?, ?, ?,?)',[username, email,role, hashedPassword]
        );

        return res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = UserRegistration;
