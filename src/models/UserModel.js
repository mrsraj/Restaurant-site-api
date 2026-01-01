const pool = require('../config/db');

const getUserByUsername = async (username) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE mob_no = ?', [username]);
    return rows;
};

module.exports = { getUserByUsername };
