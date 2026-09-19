import pool from '../config/db.js';
export const findByRestaurant = async restaurantId => {
 const [rows] = await pool.query('SELECT r.id, r.name, h.hero_title, h.hero_image_url, h.description, h.opening_hours, h.sections FROM restaurants r LEFT JOIN restaurant_home h ON h.restaurant_id = r.id WHERE r.id = ?', [restaurantId]);
 return rows[0] || null;
};

export default { findByRestaurant };
