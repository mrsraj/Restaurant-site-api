const pool = require("../config/db");

async function createCategory(req, res) {
    try {
        const { c_name, description, image_url, is_active } = req.body;

        if (!c_name) {
            return res.status(400).json({
                success: false,
                message: "Category name (c_name) is required",
            });
        }

        // Handle duplicate c_name (unique key)
        const [rows] = await pool.query('SELECT c_name FROM categories');
        const categoryNames = rows.map(row => row.c_name.toLowerCase());
        if (categoryNames.includes(c_name.toLowerCase())) {
            return res.status(409).json({
                success: false,
                message: "Category name already exists",
            });
        }

        const sql = `INSERT INTO categories (c_name, description, image_url, is_active) VALUES (?, ?, ?, ?)`;

        const values = [
            c_name,
            description || null,
            image_url || null,
            typeof is_active === "number" ? is_active : 1,
        ];

        const [result] = await pool.query(sql, values);

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            id: result.insertId,
        });

    } catch (error) {
        console.error("Create Category Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

module.exports = createCategory;
