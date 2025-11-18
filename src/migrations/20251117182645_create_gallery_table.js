/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('gallery', function (table) {
        table.increments('id').primary();
        table.string('image_url', 255).notNullable();  // gallery image link
        table.string('caption', 150).nullable();       // optional
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('gallery');
};
