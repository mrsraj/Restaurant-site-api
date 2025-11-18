const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const {getUserByUsername} = require('../models/UserModel.js');

const userLogin = async (req, res) => {
    const { username, password } = req.body;
    console.log("API is working fine:", username, password);

    try {
        const results = await getUserByUsername(username);

        console.log("Query results:", results);
        console.log("Query results:", results.length);

        if (results.length === 0) {
            return res.status(401).json({ message: 'User Does Not Present' });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid passowrd' });
        }

        const token = jwt.sign(
            { username: user.username, role: user.role },
            process.env.JWT_SECRET || 'defaultSecret',
            { expiresIn: '1h' }
        );
        let role = user.role;
        return res.json({ token,role });

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: 'Server error', error: err });
    }
};


module.exports = userLogin;
