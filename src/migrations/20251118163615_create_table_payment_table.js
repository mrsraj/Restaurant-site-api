/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('payment', function (table) {

        table.increments('payment_id').primary();

        table.integer('invoice_id').unsigned().notNullable();
        table.integer('customer_id').unsigned().notNullable();

        table.date('payment_date').notNullable();
        table.decimal('amount', 10, 2).notNullable();

        table.enum('method', ['cash', 'card', 'upi', 'bank_transfer', 'wallet']).notNullable();
        table.string('reference_number', 100).nullable(); // transaction id, utr, etc.

        table.timestamp('created_at').defaultTo(knex.fn.now());

        // Foreign keys
        table.foreign('invoice_id').references('invoice_id').inTable('invoice').onDelete('CASCADE');
        table.foreign('customer_id').references('id').inTable('users').onDelete('CASCADE');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('payment');
};
