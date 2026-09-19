import AppError from '../../utils/app-error.js';
import pool from '../../config/db.js';
import uploadOnCloudinary from '../../integrations/cloudinary.js';
import fs from 'fs';
async function createCategoryAndMenuFlat(input = {}, context = {}) {
  console.log("Body:", input);
  console.log("File:", context.file);
  let imagePath = null;
  try {
    const {
      c_name,
      name,
      descriptions,
      price,
      discount,
      is_active
    } = input;
    if (context.file) {
      const cloudinaryResponse = await uploadOnCloudinary(context.file.path);
      if (!cloudinaryResponse) {
        throw new AppError(500, {
          success: false,
          message: "Image upload failed"
        });
      }
      imagePath = cloudinaryResponse.secure_url;
    }
    if (!c_name) {
      throw new AppError(400, {
        success: false,
        message: "Category name is required"
      });
    }
    let categoryId;
    const [existingRows] = await pool.query("SELECT id FROM categories WHERE c_name = ? AND restaurant_id = ? LIMIT 1", [c_name, context.restaurantId]);
    if (existingRows.length > 0) {
      categoryId = existingRows[0].id;
    } else {
      const [catResult] = await pool.query(`INSERT INTO categories (c_name, is_active, restaurant_id)
                 VALUES (?, ?, ?)`, [c_name, 1, context.restaurantId]);
      categoryId = catResult.insertId;
    }
    if (!name) {
      throw new AppError(400, {
        success: false,
        message: "Menu item name is required"
      });
    }
    if (!price || isNaN(price)) {
      throw new AppError(400, {
        success: false,
        message: "Valid price is required"
      });
    }
    const [menuResult] = await pool.query(`INSERT INTO menu
                (name, descriptions, image_urls, price, discount, category_id, is_active, restaurant_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [name, descriptions || null, imagePath, Number(price), discount ? Number(discount) : 0, categoryId, Number(is_active) === 0 ? 0 : 1, context.restaurantId]);
    return {
      success: true,
      message: "Menu item created successfully",
      category_id: categoryId,
      menu_id: menuResult.insertId
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Create Menu Error:", error);
    throw new AppError(500, {
      success: false,
      message: "Internal Server Error"
    });
  }
}
export default createCategoryAndMenuFlat;
