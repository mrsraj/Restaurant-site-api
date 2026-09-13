exports.up = async function (knex) {
  await knex.schema.createTable('restaurants', table => {
    table.increments('id').primary();
    table.string('name', 150).notNullable();
    table.timestamps(true, true);
  });
  await knex('restaurants').insert({ id: 1, name: 'Default Restaurant' });
  for (const name of ['users', 'menu', 'categories', 'invoice', 'table_reservation']) {
    await knex.schema.alterTable(name, table => {
      table.integer('restaurant_id').unsigned().nullable().references('id').inTable('restaurants').onDelete('RESTRICT');
    });
    if (name !== 'users') await knex(name).update({ restaurant_id: 1 });
  }
  const [indexes] = await knex.raw('SHOW INDEX FROM categories');
  const nameIndex = indexes.find(index => index.Column_name === 'c_name' && Number(index.Non_unique) === 0);
  await knex.schema.alterTable('categories', table => {
    if (nameIndex) table.dropUnique(['c_name'], nameIndex.Key_name);
    table.unique(['restaurant_id', 'c_name']);
  });
  await knex('users').where('role', 'admin').update({ role: 'restaurant_admin', restaurant_id: 1 });
  await knex.schema.alterTable('users', table => {
    table.string('email', 100).nullable().alter();
    table.string('otp', 6).nullable().alter();
    table.datetime('otp_expiry').nullable().alter();
  });
};
exports.down = async function (knex) {
  // Refuse to collapse multiple restaurants or privileged accounts into the legacy schema.
  const [{ count }] = await knex('restaurants').count('* as count');
  const privileged = await knex('users').whereIn('role', ['super_admin', 'kitchen']).first();
  if (Number(count) > 1 || privileged) throw new Error('Resolve additional restaurants and roles before rollback');
  await knex.schema.alterTable('categories', table => {
    table.dropUnique(['restaurant_id', 'c_name']);
    table.unique(['c_name']);
  });
  await knex('users').where('role', 'restaurant_admin').update({ role: 'admin' });
  for (const name of ['users', 'menu', 'categories', 'invoice', 'table_reservation']) {
    await knex.schema.alterTable(name, table => { table.dropForeign('restaurant_id'); table.dropColumn('restaurant_id'); });
  }
  await knex.schema.dropTable('restaurants');
};
