const pool = require('../config/db');
const getMenu = async restaurantId => {
  const [rows] = await pool.query(`
        SELECT 
            m.id, 
            m.name, 
            m.descriptions,
            m.image_urls,
            m.price,
            m.discount,
            c.c_name,
            c.id as cat_id,
            m.is_active
        FROM menu m 
        LEFT JOIN categories c ON m.category_id = c.id
        WHERE m.restaurant_id = ?
    `, [restaurantId]);
  return rows;
};
module.exports = getMenu;

Object.assign(module.exports, require('./table-model')({
  "table": "menu",
  "primaryKey": "id",
  "columns": [
    "id",
    "name",
    "descriptions",
    "image_urls",
    "price",
    "discount",
    "category_id",
    "is_active",
    "created_at",
    "restaurant_id"
  ]
}));
