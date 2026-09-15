exports.up = async knex => {
  const [constraints] = await knex.raw("SELECT TABLE_NAME, CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_TYPE = 'FOREIGN KEY'");
  for (const row of constraints) await knex.raw('ALTER TABLE ?? DROP FOREIGN KEY ??', [row.TABLE_NAME, row.CONSTRAINT_NAME]);
};
exports.down = async () => {
  throw new Error('Restore foreign keys using the saved schema definitions after checking for orphan records. Automatic rollback is intentionally unavailable.');
};
