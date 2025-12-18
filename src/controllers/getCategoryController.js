const pool = require('../config/db');

async function GetCategory(req, res) {
    try {
        const [categories] = await pool.query(
            'SELECT id, c_name FROM categories'
        );

        return res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Failed to fetch categories'
        });
    }
}

module.exports = GetCategory;
