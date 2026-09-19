import AppError from '../../utils/app-error.js';
import pool from '../../config/db.js';
import uploadOnCloudinary from '../../integrations/cloudinary.js';
export default async (input = {}, context = {}) => {
  const id = context.params.id;
  const allowed = ['name', 'descriptions', 'price', 'discount', 'category_id', 'is_active'];
  const updates = Object.fromEntries(allowed.filter(key => input[key] !== undefined).map(key => [key, input[key]]));
  if (!Object.keys(updates).length && !context.file) throw new AppError(400, {
    message: 'No menu fields provided'
  });
  if (updates.name !== undefined && (typeof updates.name !== 'string' || !updates.name.trim())) throw new AppError(400, {
    message: 'Name must not be empty'
  });
  for (const field of ['price', 'discount']) {
    if (updates[field] !== undefined && (updates[field] === '' || !Number.isFinite(Number(updates[field])) || Number(updates[field]) < 0 || field === 'discount' && Number(updates[field]) > 100)) throw new AppError(400, {
      message: 'Invalid ' + field
    });
  }
  if (updates.is_active !== undefined && ![0, 1, '0', '1', true, false].includes(updates.is_active)) throw new AppError(400, {
    message: 'is_active must be 0 or 1'
  });
  try {
    const [rows] = await pool.query('SELECT id FROM menu WHERE id = ? AND restaurant_id = ?', [id, context.restaurantId]);
    if (!rows.length) throw new AppError(404, {
      message: 'Menu item not found'
    });
    if (updates.category_id !== undefined) {
      const [categories] = await pool.query('SELECT id FROM categories WHERE id = ? AND restaurant_id = ?', [updates.category_id, context.restaurantId]);
      if (!categories.length) throw new AppError(400, {
        message: 'Category does not belong to this restaurant'
      });
    }
    if (context.file) {
      const result = await uploadOnCloudinary(context.file.path);
      if (!result) throw new AppError(502, {
        message: 'Image upload failed'
      });
      updates.image_urls = result.secure_url;
    }
    const fields = Object.keys(updates);
    await pool.query('UPDATE menu SET ' + fields.map(key => key + ' = ?').join(', ') + ' WHERE id = ? AND restaurant_id = ?', [...Object.values(updates), id, context.restaurantId]);
    return {
      success: true,
      message: 'Menu item updated successfully'
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw error;
  }
};
