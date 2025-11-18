/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('restaurant_info', function (table) {
        table.increments('id').primary();
        table.string('restaurant_name', 150).notNullable();
        table.string('address', 255).notNullable();
        table.string('phone', 20).notNullable();
        table.string('email', 100).nullable();
        table.text('description').nullable();
        table.string('logo_url', 255).nullable();
        table.string('cover_image_url', 255).nullable();
        table.time('opening_time').nullable();
        table.time('closing_time').nullable();
        table.boolean('is_open').defaultTo(true);
        table.boolean('is_active').defaultTo(true);
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('restaurant_info');
};
