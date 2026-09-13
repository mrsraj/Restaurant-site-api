const pool = require('../../config/db');
const uploadOnCloudinary = require('../../Utility/Cloudinary');
module.exports = async (req, res, next) => {
  const id = req.params.id;
  const allowed = ['name', 'descriptions', 'price', 'discount', 'category_id', 'is_active'];
  const updates = Object.fromEntries(allowed.filter(key => req.body[key] !== undefined).map(key => [key, req.body[key]]));
  if (!Object.keys(updates).length && !req.file) return res.status(400).json({ message: 'No menu fields provided' });
  if (updates.name !== undefined && (typeof updates.name !== 'string' || !updates.name.trim()))
    return res.status(400).json({ message: 'Name must not be empty' });
  for (const field of ['price', 'discount']) {
    if (updates[field] !== undefined && (updates[field] === '' || !Number.isFinite(Number(updates[field])) || Number(updates[field]) < 0 || (field === 'discount' && Number(updates[field]) > 100)))
      return res.status(400).json({ message: 'Invalid ' + field });
  }
  if (updates.is_active !== undefined && ![0, 1, '0', '1', true, false].includes(updates.is_active))
    return res.status(400).json({ message: 'is_active must be 0 or 1' });
  try {
    const [rows] = await pool.query('SELECT id FROM menu WHERE id = ? AND restaurant_id = ?', [id, req.restaurantId]);
    if (!rows.length) return res.status(404).json({ message: 'Menu item not found' });
    if (updates.category_id !== undefined) {
      const [categories] = await pool.query('SELECT id FROM categories WHERE id = ? AND restaurant_id = ?', [updates.category_id, req.restaurantId]);
      if (!categories.length) return res.status(400).json({ message: 'Category does not belong to this restaurant' });
    }
    if (req.file) {
      const result = await uploadOnCloudinary(req.file.path);
      if (!result) return res.status(502).json({ message: 'Image upload failed' });
      updates.image_urls = result.secure_url;
    }
    const fields = Object.keys(updates);
    await pool.query('UPDATE menu SET ' + fields.map(key => key + ' = ?').join(', ') + ' WHERE id = ? AND restaurant_id = ?',
      [...Object.values(updates), id, req.restaurantId]);
    res.json({ success: true, message: 'Menu item updated successfully' });
  } catch (error) { next(error); }
};
