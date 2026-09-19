import pool from '../config/db.js';
// Internal data access only. Services remain responsible for role/ownership checks.
export default function tableModel({ table, primaryKey, columns }) {
  return {
    table, primaryKey, columns: Object.freeze(columns),
    async findById(id, { restaurantId, connection = pool } = {}) {
      if (!Number.isSafeInteger(Number(id)) || Number(id) < 1) throw new Error('Valid record ID required');
      const scoped = columns.includes('restaurant_id');
      if (scoped && (!Number.isSafeInteger(Number(restaurantId)) || Number(restaurantId) < 1)) throw new Error('Restaurant scope required');
      const sql = 'SELECT * FROM ?? WHERE ?? = ?' + (scoped ? ' AND restaurant_id = ?' : '') + ' LIMIT 1';
      const values = [table, primaryKey, Number(id)];
      if (scoped) values.push(Number(restaurantId));
      const [rows] = await connection.query(sql, values);
      return rows[0] || null;
    }
  };
};
