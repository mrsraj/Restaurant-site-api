/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('invoice', function (table) {
        table.increments('invoice_id').primary();

        table.integer('customer_id').unsigned().notNullable();

        table.date('invoice_date').notNullable();
        table.date('due_date').nullable();

        table.enum('order_status', ['pending', 'accepted', 'cancelled','delivered'])
             .defaultTo('pending');

        table.enum('payment_status', ['pending','paid','unpaid','cancelled'])
             .defaultTo('pending');

        table.decimal('total_amount', 10, 2).notNullable();

        table.text('notes').nullable();

        table.timestamp('created_at').defaultTo(knex.fn.now());

        // Foreign key connection with users table
        table.foreign('customer_id').references('id').inTable('users').onDelete('CASCADE');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('invoice');
};
