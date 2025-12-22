/**
 * @param { import("knex").Knex } knex
 */
exports.up = async function (knex) {
  await knex.schema.alterTable('invoice', function (table) {
    // Remove wrong status column if exists
    table.dropColumn('status');

    // Order status
    table
      .enum('order_status', ['pending', 'accepted', 'cancelled'])
      .defaultTo('pending');

    // Payment status
    table
      .enum('payment_status', ['pending','paid','unpaid','cancelled'])
      .defaultTo('pending');
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('invoice', function (table) {
    table.dropColumn('payment_status');
    table.dropColumn('status');

    // Restore old column if needed
    table
      .enum('status', ['pending', 'paid', 'unpaid', 'cancelled'])
      .defaultTo('pending');
  });
};
