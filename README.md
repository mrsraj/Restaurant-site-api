🍽️ # Restaurant Admin Dashboard – Backend

   Backend server for the Restaurant Admin Dashboard, built using Node.js, Express, MySQL, and Knex.js.
   Handles authentication, menu management, orders, payments (Razorpay), and analytics APIs.

# Features

🔐 JWT-based Admin Authentication
📜 Menu Management (CRUD)
🛒 Orders Management
💳 Razorpay Payment Integration
📊 Revenue & Order Analytics
🔔 Centralized Error Handling

# Tech Stack

Runtime: Node.js
Framework: Express.js
Database: MySQL
Query Builder: Knex.js
Connection Pool: MySQL2 (via Knex)
Authentication: JWT
Payments: Razorpay
Config: dotenv

# Folder Structure
restaurant-admin-backend/
│── src/

│   ├── config/

│   │   └── db.js

│   ├── controllers/

│   ├── routes/

│   ├── middlewares/

│   ├── services/

│   ├── utils/

│   └── server.js
│
│── knexfile.js
│── .env
│── package.json
│── README.md

⚙️ Environment Variables

    PORT=3000
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=restaurant_db
    DB_PORT=3306

    JWT_SECRET=your_jwt_secret

    RAZORPAY_KEY_ID=rzp_test_xxxxx
    RAZORPAY_KEY_SECRET=xxxxxxxx

🔗 Knex + MySQL Pool Configuration

    knexfile.js
    import dotenv from "dotenv";
    dotenv.config();

export default {

  client: "mysql2",
  
  connection: {
  
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  },
  
   pool: {
     min: 2,
     max: 10,
  },
  migrations: {
    directory: "./src/migrations",
  },
};

src/config/db.js
import knex from "knex";
import config from "../../knexfile.js";

const db = knex(config);

export default db;

🗄️ Database Table Creation (Knex Migrations)
Create users Table
export function up(knex) {
  return knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("email").unique().notNullable();
    table.string("password").notNullable();
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable("users");
}

# Create menu_items Table

export function up(knex) {

  return knex.schema.createTable("menu_items", (table) => {
  
    table.increments("id").primary();
    table.string("name").notNullable();
    table.decimal("price", 10, 2).notNullable();
    table.integer("discount").defaultTo(0);
    table.boolean("available").defaultTo(true);
    table.timestamps(true, true);
    
  });
}

# Run Migrations

   npx knex migrate:latest

# Install Dependencies

   npm install

# Start Server

   Development
   npm run dev
   Production
   npm start

# API Endpoints
   Auth
   
   POST /api/auth/login
   
  Menu

GET /api/menu

POST /api/menu

PUT /api/menu/:id

DELETE /api/menu/:id

# Orders

GET /api/orders

POST /api/orders

PUT /api/orders/:id/status

# Payments

POST /api/payment/create-order

POST /api/payment/verify

# Razorpay Payment Flow

Frontend requests order creation

Backend creates Razorpay order

Frontend opens Razorpay Checkout

Backend verifies payment signature

Order & payment status saved in MySQL

# 🔒  Security Notes

Do not expose Razorpay secret keys

Use HTTPS in production

Validate all requests

Verify payments server-side

# 📌 Author

Restaurant Admin Dashboard – Backend
Built with Node.js, Express, MySQL, Knex.js
