require('dotenv').config();

module.exports = {

  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'root',
      database: process.env.DB_NAME || 'restaurant_db'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './src/migrations'
    }
  },

  production: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,      // Hostinger MySQL host
      user: process.env.DB_USER,      // Hostinger DB user
      password: process.env.DB_PASS,  // Hostinger DB password
      database: process.env.DB_NAME,  // Hostinger DB name
      ssl: false                      // Required for Hostinger shared hosting
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './src/migrations'
    }
  }

};
