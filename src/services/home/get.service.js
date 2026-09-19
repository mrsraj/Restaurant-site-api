import home from '../../models/restaurant-home.model.js';
import pool from '../../config/db.js';
import AppError from '../../utils/app-error.js';
export default async (input, context) => {
 const restaurant = await home.findByRestaurant(context.restaurantId);
 if (!restaurant) throw new AppError(404, { message: 'Restaurant not found' });
 const [dishes] = await pool.query('SELECT id, name, image_urls, price, discount FROM menu WHERE restaurant_id = ? AND is_active = 1 ORDER BY id DESC LIMIT 12', [context.restaurantId]);
 let sections = restaurant.sections;
 if (typeof sections === 'string') { try { sections = JSON.parse(sections); } catch { sections = []; } }
 return { restaurant: { ...restaurant, sections: Array.isArray(sections) ? sections : [] }, dishes };
};
