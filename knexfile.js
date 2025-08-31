// // Update with your config settings.


// knexfile.js
module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: '127.0.0.1',
      user: 'root',
      password: 'root',
      database: 'restaurant_db'
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


