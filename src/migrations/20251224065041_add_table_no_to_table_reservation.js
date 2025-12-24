/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable("table_reservation", function (table) {
        table.string("table_no", 100).nullable().after("customer_email");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable("table_reservation", function (table) {
        table.dropColumn("table_no");
    });
};
