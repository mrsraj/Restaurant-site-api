/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('invoice_item', function (table) {

        table.increments('invoice_item_id').primary();

        table.integer('invoice_id').unsigned().notNullable();
        table.integer('product_id').unsigned().notNullable();

        table.integer('quantity').unsigned().notNullable();
        table.decimal('unit_price', 10, 2).notNullable();
        table.decimal('line_total', 10, 2).notNullable();

        table.timestamp('created_at').defaultTo(knex.fn.now());

        // Foreign keys
        table.foreign('invoice_id').references('invoice_id').inTable('invoice').onDelete('CASCADE');

        // Optional: If you have products table
        table.foreign('product_id').references('id').inTable('menu').onDelete('CASCADE');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('invoice_item');
};
