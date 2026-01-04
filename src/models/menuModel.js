const pool = require('../config/db');

const getMenu = async () => {
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
    `);
    return rows;
};

module.exports = getMenu;
