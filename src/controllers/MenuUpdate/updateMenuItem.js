const pool = require("../../config/db");
const uploadOnCloudinary = require("../../Utility/Cloudinary");

const updateMenuItem = async (req, res) => {
    try {
        const {
            id,
            name,
            descriptions,
            price,
            discount,
            category_id,
            is_active,
        } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Menu item ID is required",
            });
        }

        if (!category_id) {
            return res.status(400).json({
                success: false,
                message: "Category is required",
            });
        }

        const [rows] = await pool.query(
            "SELECT image_urls FROM menu WHERE id = ?",
            [id]
        );

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found",
            });
        }

        let imageName = rows[0].image_urls;

        if (req.file) {
            const cloudinaryResponse = await uploadOnCloudinary(req.file.path);

            if (!cloudinaryResponse) {
                return res.status(500).json({
                    success: false,
                    message: "Image upload failed",
                });
            }

            imageName = cloudinaryResponse.secure_url;
        }

        await pool.query(
            `UPDATE menu SET
                name = ?,
                descriptions = ?,
                price = ?,
                discount = ?,
                is_active = ?,
                image_urls = ?,
                category_id = ?
             WHERE id = ?`,
            [
                name,
                descriptions,
                price,
                discount,
                is_active,
                imageName,
                category_id,
                id,
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Menu item updated successfully",
        });

    } catch (error) {
        console.error("Update Menu Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update menu item",
        });
    }
};

module.exports = updateMenuItem;
