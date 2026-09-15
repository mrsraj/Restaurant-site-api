# Database structure

schema.sql contains the current 11 application tables for MySQL 8, without foreign keys. Run it in an empty selected database. CREATE TABLE statements can be executed in any order. It does not insert users, role seed data or restaurants, and does not initialize Knex migration history. Do not run historical migrations on top of this snapshot; the snapshot and historical migrations are separate installation paths.

Existing installations use migration 20260916000000_remove_foreign_keys.js. It removes foreign keys only, preserving rows, columns, primary keys, unique constraints and indexes. Applied to the local database; zero foreign keys remain. Historical migrations were preserved. Local history references missing historical files, so only the named migration was applied with historical-list validation disabled.

| Table | Purpose / logical relationships |
| --- | --- |
| restaurants | Restaurant tenant identity |
| roles | Role definitions; admin, manager, staff, users map to application roles |
| users | Accounts; role_id points to roles.role_id, restaurant_id to restaurants.id |
| categories | Restaurant menu categories |
| menu | Menu items linked to category and restaurant |
| invoice | Orders linked to customer and restaurant; includes preparation and payment statuses |
| invoice_item | Order lines linked to invoice and menu product |
| payment | Payments linked to invoice and customer |
| table_reservation | Reservations linked to user and restaurant |
| restaurant_info | Legacy restaurant profile data |
| gallery | Legacy gallery data |

Relationship columns remain ordinary indexed columns where existing indexes were present. Index names ending in _foreign are indexes, not foreign-key constraints. No CASCADE or RESTRICT behavior remains. Application validation must enforce valid references and handle deletion dependencies; removing constraints does not automatically add these checks. Prefer deactivating accounts/menu items to deleting historical order references.

schema-before-no-foreign-keys.sql preserves original table definitions as a schema-only recovery reference. It is not an executable rollback against existing tables. Restore individual foreign keys with ALTER TABLE only after checking for orphan data. MySQL ALTER TABLE commits independently; the migration cannot be transactionally rolled back.

The schema preserves the current application's contract, including existing names and nullable tenant IDs. restaurant_info and gallery remain legacy unscoped tables; full tenant isolation for these features requires API changes as well as a separate schema migration.
