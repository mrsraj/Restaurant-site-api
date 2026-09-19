/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
    return knex.schema.createTable('menu', function (table) {
        table.increments('id').primary();
        table.string('name', 100).notNullable();
        table.text('descriptions').nullable();
        table.string('image_urls', 255).nullable();  // store image url
        table.decimal('price', 10, 2).notNullable();
        table.decimal('discount', 5, 2).defaultTo(0); // percentage discount
        table.integer('category_id').unsigned().notNullable();
        table.boolean('is_active').defaultTo(true);
        table.timestamp('created_at').defaultTo(knex.fn.now());

        // If you want foreign key relation:
        table.foreign('category_id').references('id').inTable('categories');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
    return knex.schema.dropTable('menu');
};
