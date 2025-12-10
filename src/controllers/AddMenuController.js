const pool = require("../config/db");

async function SetCategories(req, res) {
    try {
        const { name, descriptions, image_urls, price, discount, category_id, is_active } = req.body;

        const query = `
      INSERT INTO categories 
        (name, descriptions, image_urls, price, discount, category_id, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

        const values = [
            name,
            descriptions,
            image_urls,
            price,
            discount ?? 0.00,
            category_id,
            is_active ?? 1,
        ];

        const [result] = await pool.query(query, values);

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            inserted_id: result.insertId,
        });

    } catch (error) {
        console.error("Category Insert Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

module.exports = SetCategories;
