import "dotenv/config";
import http from "http";

import app from "./app.js";
import pool from "./config/db.js";
import initializeSockets from "./sockets.js";

const server = http.createServer(app);

// Initialize Socket.IO
initializeSockets(server);

async function startServer(port = process.env.PORT || 3000) {
  try {
    // Verify database connection before starting server
    await pool.query("SELECT 1");
    console.log("Database connected successfully");

    await new Promise((resolve, reject) => {
      server.once("error", reject);

      server.listen(port, () => {
        server.removeListener("error", reject);

        console.log(
          `Server running on port ${server.address().port}`
        );

        resolve();
      });
    });

    return server;
  } catch (error) {
    console.error("Failed to start server:", error.message);
    throw error;
  }
}

startServer().catch(async (error) => {
  console.error("Server startup failed:", error);

  await pool.end();
  process.exit(1);
});

export { app, server, startServer };