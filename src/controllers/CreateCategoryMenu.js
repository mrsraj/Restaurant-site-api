const pool = require("../config/db");

async function createCategoryAndMenuFlat(req, res) {
    console.log("Body:", req.body);
    console.log("File:", req.file);

    try {
        const {
            c_name,
            name,
            descriptions,
            price,
            discount,
            is_active,
        } = req.body;

        // Multer file (menu image)
        const imagePath = req.file ? req.file.filename : null;

        /* ======================
           CATEGORY VALIDATION
        ====================== */
        if (!c_name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required",
            });
        }

        /* ======================
           CHECK / CREATE CATEGORY
        ====================== */
        let categoryId;

        const [existingRows] = await pool.query(
            "SELECT id FROM categories WHERE c_name = ? LIMIT 1",
            [c_name]
        );

        if (existingRows.length > 0) {
            categoryId = existingRows[0].id;
        } else {
            const [catResult] = await pool.query(
                `INSERT INTO categories (c_name, is_active)
                 VALUES (?, ?)`,
                [c_name, 1]
            );
            categoryId = catResult.insertId;
        }

        /* ======================
           MENU VALIDATION
        ====================== */
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Menu item name is required",
            });
        }

        if (!price || isNaN(price)) {
            return res.status(400).json({
                success: false,
                message: "Valid price is required",
            });
        }

        /* ======================
           INSERT MENU ITEM
        ====================== */
        const [menuResult] = await pool.query(
            `INSERT INTO menu
                (name, descriptions, image_urls, price, discount, category_id, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                descriptions || null,
                imagePath,                 // ✅ multer image
                Number(price),
                discount ? Number(discount) : 0,
                categoryId,
                Number(is_active) === 0 ? 0 : 1,
            ]
        );

        /* ======================
           RESPONSE
        ====================== */
        return res.status(201).json({
            success: true,
            message: "Menu item created successfully",
            category_id: categoryId,
            menu_id: menuResult.insertId,
        });

    } catch (error) {
        console.error("Create Menu Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

module.exports = createCategoryAndMenuFlat;
