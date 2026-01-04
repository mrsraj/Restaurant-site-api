/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('table_reservation', function (table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable();
        
        table.string('customer_name', 100).notNullable();
        table.string('customer_phone', 20).notNullable();
        table.string('customer_email', 100).nullable();
        table.string("table_no", 100).nullable();

        table.integer('number_of_persons').unsigned().notNullable();
        table.date('reservation_date').notNullable();
        table.time('reservation_time').notNullable();

        table.text('special_request').nullable();

        table.enum('status', ['pending', 'confirmed', 'cancelled', 'done']).defaultTo('pending');
        table.timestamp('created_at').defaultTo(knex.fn.now());

        //Foregin key 
        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');;
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('table_reservation');
};
