# REST API v1

All JSON API resources are under `/api/v1`. The frontend has been migrated in the same change. Old action-style endpoints are removed; external clients must update their URLs.

| Method | Resource | Purpose |
| --- | --- | --- |
| POST | /sessions | Authenticate and issue a bearer token |
| POST | /users | Register a customer |
| GET | /users | List users (super admin) |
| GET | /users/me | Current authenticated identity |
| POST | /password-reset-requests | Request a password reset code |
| POST | /password-resets | Submit the code and new password |
| GET | /menu-items | List selected restaurant's menu |
| GET | /menu-items/:id | Retrieve one menu item |
| POST | /menu-items | Create a menu item (multipart image supported) |
| PATCH | /menu-items/:id | Update only supplied fields |
| DELETE | /menu-items/:id | Delete a menu item |
| GET | /categories | List selected restaurant's categories |
| POST | /uploads | Create an uploaded image (multipart field: image) |
| POST | /orders | Create a customer order |
| GET | /orders | List restaurant orders (staff) |
| GET | /orders/:id | Retrieve a customer's own order |
| PATCH | /orders/:id | Update order_status or payment_status (kitchen cannot change payments) |
| GET | /reservations | List own/customer or restaurant/admin reservations |
| POST | /reservations | Create a reservation |
| PATCH | /reservations/:id | Update reservation status |
| GET, POST | /restaurants | List accessible restaurants; create as super admin |
| GET, POST | /staff | List/create staff within role and restaurant permissions |
| POST | /payment-orders | Create a payment-provider order |
| POST | /orders/:id/payment-verifications | Submit a payment verification for an owned order |
| PATCH | /orders/:id/payment | Report an owned payment as failed: {"status":"failed"} |
| GET | /health | Process health |

IDs identifying an existing resource belong in the URL. PATCH bodies contain changed fields; a body ID cannot override the URL. GET does not mutate data. Creation uses POST; partial updates use PATCH; DELETE returns 204 without a JSON body. Resource creation returns 201 where a resource is created; completed operations return 200, malformed input 400, missing authentication 401, forbidden access 403, and missing resources 404. Password-reset and payment-verification submissions retain 200 acknowledgement responses.

Bearer authentication is stateless. Roles are reloaded from the database. Restaurant staff are scoped to their database assignment; super admins select a restaurant using X-Restaurant-Id. Public menu requests can select restaurant_id or that header, defaulting to restaurant 1.

Responses retain the existing collection formats to match the app. Single menu-item/order responses contain a single object in data. Errors contain a message. No API response envelope standard such as JSON:API is implied.

The API checks MySQL at startup and no longer waits for the unused Redis connection. Run `npm start` from Restaurant-API. Test with `node --test tests/authorization.test.js tests/rest.test.js`.

Examples:
```http
GET /api/v1/menu-items
X-Restaurant-Id: 1

PATCH /api/v1/menu-items/7
Authorization: Bearer <token>
Content-Type: application/json

{"price":120}

PATCH /api/v1/orders/23
Authorization: Bearer <token>
Content-Type: application/json

{"order_status":"accepted"}
```

