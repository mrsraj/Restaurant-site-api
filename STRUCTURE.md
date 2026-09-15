# Backend structure

The backend is organized by responsibility, with feature directories inside services. Existing /api/v1 endpoints, role mappings, and restaurant isolation remain in place.

```text
Restaurant-API/
├── src/
│   ├── app.js                       # Express setup; importing does not start a listener
│   ├── server.js                    # MySQL readiness check, HTTP listener and sockets
│   ├── config/                      # Database, role mapping, payment and Redis configuration
│   ├── routes/                      # URLs, HTTP verbs and middleware composition
│   │   ├── index.js                 # Mounts all /api/v1 resources
│   │   ├── auth.routes.js
│   │   ├── users.routes.js
│   │   ├── menu.routes.js
│   │   ├── categories.routes.js
│   │   ├── orders.routes.js
│   │   ├── reservations.routes.js
│   │   ├── restaurants.routes.js
│   │   ├── staff.routes.js
│   │   ├── payments.routes.js
│   │   └── uploads.routes.js
│   ├── controllers/                 # Feature folders containing HTTP controllers
│   │   ├── auth/auth.controller.js
│   │   ├── users/users.controller.js
│   │   ├── menu/menu.controller.js
│   │   ├── categories/categories.controller.js
│   │   ├── orders/orders.controller.js
│   │   ├── reservations/reservations.controller.js
│   │   ├── restaurants/restaurants.controller.js
│   │   ├── staff/staff.controller.js
│   │   ├── payments/payments.controller.js
│   │   └── uploads/uploads.controller.js
│   ├── services/                    # Feature rules, validation and transaction orchestration
│   │   ├── auth/
│   │   ├── users/
│   │   ├── menu/
│   │   ├── categories/
│   │   ├── orders/
│   │   ├── reservations/
│   │   ├── restaurants/
│   │   ├── staff/
│   │   ├── payments/
│   │   └── uploads/
│   ├── models/                      # Reusable SQL operations
│   │   ├── user.model.js
│   │   ├── menu.model.js
│   │   ├── invoice.model.js
│   │   ├── invoice-item.model.js
│   │   └── payment.model.js
│   ├── middlewares/                 # Authentication, authorization, scope, uploads and errors
│   ├── integrations/                # Cloudinary, email and existing WhatsApp integration
│   ├── utils/                       # Controller adapter and AppError
│   ├── sockets/                     # Socket.IO registration
│   └── migrations/                  # Existing database migration history
├── scripts/                         # Administrative commands
├── tests/                           # Authorization, service and HTTP regression coverage
└── uploads/                         # Runtime upload directory
```

## Request flow

1. A route selects authentication, role and restaurant-scope middleware.
2. A controller uses the controller adapter to extract input and trusted context.
3. A service receives plain objects, performs its operation and returns data.
4. The controller sends the HTTP success status. AppError failures go to the shared error middleware.

Services have the signature `service(input, context)`. The context contains `user`, `restaurantId`, `params`, and optionally `file`. Services do not receive Express req/res/next objects. Identity and restaurant scope must come from middleware, never from caller-supplied body fields.

Reusable queries live in models. Feature-specific SQL and transactions currently live in services; move repeated query logic into models as features grow. Do not move service permissions or transaction orchestration into route files.

## Reservation example

`POST /api/v1/reservations` follows:
`routes/reservations.routes.js → controllers/reservations/reservations.controller.js → services/reservations/create.service.js`.

The old `TableReservationController.js.js` was replaced by these correctly named modules.

## Upload example

`routes/uploads.routes.js` applies the upload middleware first.
`controllers/uploads/uploads.controller.js` delegates to `services/uploads/create.service.js`.
The service uses `integrations/cloudinary.js` and returns upload metadata. The controller returns HTTP 201.

## Commands

- `npm start`: run src/server.js.
- `npm run dev`: run the server with Node's built-in file watcher.
- `npm test`: run all test files using Node's test runner.

Restart a terminal that is still running the old src/app.js entry point. The refactor requires no database migration. See REST_API.md for routes and ROLE_AUTH.md for role setup.

## Adding a feature

Add its service under services/<feature>, export its HTTP handler from controllers/<feature>/<feature>.controller.js, define guarded routes in routes/<feature>.routes.js, and mount those routes in routes/index.js. Add models for reusable database queries and migrations only when the schema changes. Keep integration SDK calls behind integrations or their existing configuration module. Add tests for authorization, failure handling and transaction behavior.

No external emails, messages or payment operations are sent by the test suite; those boundaries are mocked.
