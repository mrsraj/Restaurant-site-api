const http = require('http');
const app = require('./app');
const pool = require('./config/db');
const server = http.createServer(app);
require('./sockets')(server);
async function startServer(port = process.env.PORT || 3000) {
  await pool.query('SELECT 1');
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, () => {
      server.removeListener('error', reject);
      console.log('Server running on port ' + server.address().port);
      resolve();
    });
  });
  return server;
}
if (require.main === module) {
  startServer().catch(async error => {
    console.error('Failed to start server:', error.message);
    await pool.end();
    process.exitCode = 1;
  });
}
module.exports = { app, server, startServer };
