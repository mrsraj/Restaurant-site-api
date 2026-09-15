# Restaurant role authentication

Roles:
- `super_admin`: creates restaurants, creates restaurant admins and kitchen accounts, and can manage a selected restaurant.
- `restaurant_admin`: manages its assigned restaurant's menu, orders, reservations, and kitchen accounts.
- `kitchen`: reads its restaurant's orders and updates order status. Cannot change payments, menus, reservations, or accounts.
- `user`: customer registration, ordering, and own reservations/order status.

## Setup
1. Back up the database and run `npx knex migrate:latest` from Restaurant-API.
2. Set a strong `JWT_SECRET` in the API environment. No fallback signing secret is used.
3. Register the intended super-admin account as an ordinary user, then run `node scripts/bootstrap-super-admin.js <mobile-number>` locally. This refuses to run if a super admin already exists.
4. Restart API and frontend, and log in again. Old tokens are intentionally rejected.
5. Super admins use **Restaurants & staff** to create restaurants and assign admins. Restaurant admins use **Kitchen staff** to add their kitchen accounts.

Existing admin accounts become restaurant_admin in Default Restaurant (ID 1). Existing menus, categories, invoices, and reservations are assigned there. No existing account is automatically promoted to super admin.

## API
- GET /api/v1/users/me: current database-backed identity.
- GET/POST /api/v1/restaurants: list accessible restaurants; only super admins create.
- GET/POST /api/v1/staff: list/create staff. Creation body: username, mob_no, password (8+ characters), role, restaurant_id, optional email.
- Staff restaurant scope comes from the database. Conflicting restaurant IDs are rejected.
- Super admins and public restaurant requests select a restaurant with X-Restaurant-Id or restaurant_id query parameter; omitted selection uses ID 1.
- Customer orders derive restaurant ownership from their menu items and reject mixed-restaurant carts.
- Public registration always creates a customer and rejects privileged roles.
- Authorization is enforced by the API; browser role checks control navigation only.

## Validation
Run `node --test tests/authorization.test.js` and `npm run build` in restaurant-site.
The migration must be run before using the updated API. MySQL DDL is not transactional; restore the backup if a migration fails partway through.

## Local installation status
The role migration was applied to the local API database on 2026-09-13. A snapshot of the affected tables and their CREATE TABLE statements is stored in `.git/role-auth-backup-1789317582658.json`; it contains private account data and must remain local.
The existing database history references two migrations absent from this checkout (`20251221132218_update_invoice_status_columns.js` and `20251224065041_add_table_no_to_table_reservation.js`). Only the role migration was applied, with historical-file validation disabled for that invocation. Restore those historical files before normal migration maintenance.
No super-admin account was selected or promoted automatically. Use the bootstrap command above with the intended existing account.

## Role-table schema
The current database stores `users.role_id`, joined to the unique `roles.role_id` (not the separate roles.id primary key). The API maps database names to its existing public role contract:

| Database name | API role | Access |
| --- | --- | --- |
| admin | super_admin | Full system administration |
| manager | restaurant_admin | Assigned restaurant administration |
| staff | kitchen | Assigned restaurant orders |
| users | user | Customer |

Login and every authenticated request require `users.isActive = 1` and `roles.isActive = 1`. Missing/unknown roles are denied. Manager and staff accounts also require restaurant_id. Numeric role IDs are looked up from the roles table rather than hard-coded.
Public registration assigns the active users role automatically and rejects caller-supplied role_id. Staff creation continues to accept the documented API role name and stores its corresponding role_id. If role_id is also supplied, it must match.
The existing six accounts had NULL role_id when this schema was inspected. No roles have been assigned automatically. Use the bootstrap script for the intended first super admin, then assign existing accounts deliberately. The previously applied migrations describe the older schema; do not rerun them to undo this manual schema change.

## Order preparation workflow

Orders follow pending -> accepted -> preparing -> completed -> delivered.

| Actor | Allowed transition |
| --- | --- |
| Restaurant admin | pending -> accepted |
| Kitchen | accepted -> preparing |
| Kitchen | preparing -> completed |
| Restaurant admin | completed -> delivered |

Super admins retain administrator actions for the selected restaurant. Kitchen lists contain only accepted, preparing, and completed orders within their assigned restaurant; pending, cancelled, and delivered orders are excluded. Kitchen staff cannot accept, deliver, cancel, or change payment status. Administrators may cancel unpaid orders before delivery. Invalid transitions and concurrent status changes return HTTP 409; unauthorized actions return HTTP 403.

Use PATCH /api/v1/orders/:id with one status field, for example {"order_status":"preparing"}. Migration 20260915000000_kitchen_order_workflow.js adds preparing and completed to invoice.order_status and was applied to the local database on 2026-09-15. Other installations must apply this migration before using these statuses.

## Live order updates

Socket.IO connects to the same origin/port as the API. Clients pass auth.token and auth.restaurantId in the handshake. The server derives customer or restaurant rooms from database-backed identity and rejects forged staff restaurant selection. It revalidates identity and scope before each notification.

Successful order creation and order/payment status PATCH requests publish orders:changed without order details. Screens refetch through authorized REST endpoints. Pending orders do not notify kitchen staff; delivery/cancellation notifications remove finished tickets from the kitchen list. Customers receive notifications only for their own orders. Arbitrary client room joins and the previous global chat broadcast are not supported by this order socket endpoint.

Admin, kitchen and customer order screens refresh on notifications and reconnect. Existing polling remains a fallback. Restart the API after deploying these changes. No database migration is required. Notifications currently use an in-process event bus: run one API process; multi-process deployments need shared event delivery and a Socket.IO adapter.
