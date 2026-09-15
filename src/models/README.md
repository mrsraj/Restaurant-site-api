# Database models

index.js exports a model for each of the 11 application tables, keyed by SQL table name, including roles. Each model exposes table, primaryKey, columns and findById(id, options). Models do not create tables; database/schema.sql and migrations do that.

Existing getUserByUsername, getMenu (default function), createInvoice, createInvoiceLine and PaymentCreation exports remain compatible with current services.

findById accepts { restaurantId, connection }. Tables with restaurant_id require a valid restaurantId; a transaction connection is optional. Services must still authorize roles and customer ownership before calling models. Returned users include sensitive fields: never send raw model records directly to clients.

roles.id is the primary key; users.role_id refers logically to the separate unique roles.role_id column. No foreign keys are created. gallery and restaurant_info remain unscoped legacy tables matching the current schema.
