export const up = async knex => {
  await knex.raw("ALTER TABLE invoice MODIFY order_status ENUM('pending','accepted','preparing','completed','cancelled','delivered') NOT NULL DEFAULT 'pending'");
};
export const down = async knex => {
  const active = await knex('invoice').whereIn('order_status', ['preparing', 'completed']).first();
  if (active) throw new Error('Finish preparing/completed orders before rolling back');
  await knex.raw("ALTER TABLE invoice MODIFY order_status ENUM('pending','accepted','cancelled','delivered') NOT NULL DEFAULT 'pending'");
};
