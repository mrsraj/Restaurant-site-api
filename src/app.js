
require('dotenv').config();

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const authRoutes = require('./routes/AuthRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require("./routes/orderRoutes");
const reservation = require('./routes/reservation.routes')

const paymentRoutes = require("./routes/payment.router");

const pool = require("./config/db");

const path = require("path");

const app = express();
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true
}));
app.use(express.json());
app.use((req, res, next) => {
    if (req.body !== undefined && (req.body === null || Array.isArray(req.body)))
        return res.status(400).json({ message: 'Request body must be a JSON object' });
    req.body ??= {};
    next();
});


// dY`� THIS IS THE FIX
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Validate numeric resource identifiers before database coercion.
app.use('/api/v1', (req, res, next) => {
    const match = /^\/(?:orders|menu-items|reservations)\/([^/]+)/.exec(req.path);
    if (match && (!/^[1-9]\d*$/.test(match[1]) || !Number.isSafeInteger(Number(match[1]))))
        return res.status(400).json({ message: 'Resource ID must be a positive integer' });
    next();
});
// Versioned REST resources.
app.use('/api/v1', authRoutes);
app.use('/api/v1', menuRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/reservations', reservation);
app.use('/api/v1', paymentRoutes);
app.use('/api/v1', require('./routes/management.routes'));
app.get('/api/v1/health', (req, res) => res.json({ status: 'ok' }));
// SOCKET.IO
const server = http.createServer(app);

const io = socketIO(server, {
    cors: { origin: "*" }
});

io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// CATCH-ALL ROUTE (must be last)
app.use((req, res) => {
    res.status(404).json({ message: "Path does not exist" });
});

app.use((error, req, res, next) => {
    console.error(error.message);
    const status = error.status >= 400 && error.status < 500 ? error.status : 500;
    res.status(status).json({ message: status === 500 ? 'Internal server error' : error.message });
});

// START SERVER
const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const startServer = async () => {
    try {
        // Confirm database connectivity; Redis is not used by the current API.
        await pool.query('SELECT 1');
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error); process.exit(1);
    }
};
if (require.main === module) startServer();
module.exports = { app, server, startServer };
