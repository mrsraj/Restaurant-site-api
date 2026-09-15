# Restaurant management API

Node.js and Express backend for restaurant menus, orders, reservations, staff access and payments. The JSON API is mounted under `/api/v1`.

## Development

Install dependencies with `npm install`, configure the existing environment and database connection, then run:

```text
npm run dev
```

Production entry point: `npm start` (`src/server.js`). Importing `src/app.js` creates the Express application without starting a listener. Development uses Node's built-in watch mode. Startup and tests were verified locally with Node 24.

Run regression tests with `npm test`. Tests mock database/integration boundaries and do not send emails, WhatsApp messages or payments.

## Project guides

- [Folder structure and development conventions](STRUCTURE.md)
- [REST endpoints](REST_API.md)
- [Role authentication and database setup](ROLE_AUTH.md)

The current separation is routes, controllers, feature services, reusable models, middleware and integrations. The folder refactor does not require a database migration. Existing role-table setup and migration-history caveats are documented in ROLE_AUTH.md.

Database access currently uses `src/config/db.js`; Knex migration configuration is in `knexfile.js`. Verify both configurations target the intended database before running migrations. Runtime file uploads are stored in `uploads/` before the Cloudinary integration processes them.
