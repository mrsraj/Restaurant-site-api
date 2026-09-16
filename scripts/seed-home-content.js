const pool = require('../src/config/db');
async function seed() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [existing] = await conn.query('SELECT id, name FROM restaurants ORDER BY id');
    let restaurants = existing;
    if (!restaurants.length) {
      const [result] = await conn.query('INSERT INTO restaurants (name) VALUES (?)', ['Demo Restaurant']);
      restaurants = [{ id: result.insertId, name: 'Demo Restaurant' }];
    }
    for (const restaurant of restaurants) {
      await conn.query(`INSERT INTO restaurant_home (restaurant_id, hero_title, hero_image_url, description, sections)
        SELECT ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM restaurant_home WHERE restaurant_id = ?)`, [
        restaurant.id, 'Welcome to ' + restaurant.name, '/images/restaurant.jpg',
        'Explore our menu and choose your next meal. This is starter content; update it with your restaurant story.',
        JSON.stringify([{ title: 'Explore our menu', description: 'Browse the dishes available from this restaurant and place your order online.' }, { title: 'Follow your order', description: 'Track your order from acceptance through preparation to delivery.' }]), restaurant.id
      ]);
      if (restaurant.name !== 'Demo Restaurant') continue;
      const [menu] = await conn.query('SELECT id FROM menu WHERE restaurant_id = ? LIMIT 1', [restaurant.id]);
      if (menu.length) continue;
      await conn.query('INSERT INTO categories (c_name, description, restaurant_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE c_name = VALUES(c_name)', ['Demo dishes', 'Sample menu for setup; replace before taking real orders.', restaurant.id]);
      const [categories] = await conn.query('SELECT id FROM categories WHERE restaurant_id = ? AND c_name = ?', [restaurant.id, 'Demo dishes']);
      for (const [name, price] of [['Demo Vegetable Pizza', 249], ['Demo Veg Burger', 129], ['Demo Pasta', 199]]) {
        await conn.query('INSERT INTO menu (name, descriptions, price, category_id, restaurant_id, is_active) VALUES (?, ?, ?, ?, ?, 1)', [name, 'Sample dish and price for demonstration. Replace before accepting real orders.', price, categories[0].id, restaurant.id]);
      }
    }
    await conn.commit();
    console.log('Home content initialized for restaurant IDs: ' + restaurants.map(r => r.id).join(', '));
  } catch (error) { await conn.rollback(); throw error; }
  finally { conn.release(); }
}
seed().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => pool.end());
