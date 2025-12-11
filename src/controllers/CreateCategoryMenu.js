const pool = require("../config/db");

async function createCategoryAndMenuFlat(req, res) {
    console.log("Menu body = ", req.body);

    try {
        const {
            c_name,
            description,
            image_url,
            category_is_active,

            name,
            descriptions,
            image_urls,
            price,
            discount,
            is_active,
        } = req.body;

        // ---- CATEGORY VALIDATION ----
        if (!c_name) {
            return res.status(400).json({
                success: false,
                message: "Category name (c_name) is required",
            });
        }

        // ---- 1) Check if category already exists ----
        let categoryId;

        const [existingRows] = await pool.query(
            "SELECT id FROM categories WHERE c_name = ? LIMIT 1",
            [c_name]
        );

        if (existingRows.length > 0) {
            categoryId = existingRows[0].id;
        } else {
            const insertCategorySql = `
                INSERT INTO categories (c_name, description, image_url, is_active)
                VALUES (?, ?, ?, ?)
            `;

            const categoryValues = [
                c_name,
                description || null,
                image_url || null,
                typeof category_is_active === "number" ? category_is_active : 1,
            ];

            const [catResult] = await pool.query(insertCategorySql, categoryValues);
            categoryId = catResult.insertId;
        }

        // ---- MENU VALIDATION ----
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Menu name (name) is required",
            });
        }

        if (!price || isNaN(Number(price))) {
            return res.status(400).json({
                success: false,
                message: "Valid menu price is required",
            });
        }

        const insertMenuSql = `
            INSERT INTO menu
                (name, descriptions, image_urls, price, discount, category_id, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const menuValues = [
            name,
            descriptions || null,
            image_urls || null,
            Number(price),
            discount != null ? Number(discount) : 0.0,
            categoryId, // 👈 final category id (existing or newly created)
            typeof is_active === "number" ? is_active : 1,
        ];

        const [menuResult] = await pool.query(insertMenuSql, menuValues);

        // ---- 4) Final response ----
        return res.status(201).json({
            success: true,
            message: "Category and Menu created successfully",
            category_id: categoryId,
            menu_id: menuResult.insertId,
        });
        
    } catch (error) {
        console.error("Create Category+Menu Flat Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

module.exports = createCategoryAndMenuFlat;
