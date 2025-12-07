
require('dotenv').config();

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const authRoutes = require('./routes/AuthRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require("./routes/orderRoutes");
const pool = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

// ROUTES
app.use('/auth', authRoutes);
app.use("/api", menuRoutes);
app.use("/api/order", orderRoutes);

// GET /user
app.get('/user', async (req, res) => {
    try {
        const [users] = await pool.query('SELECT * FROM users');
        res.status(200).json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

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

// START SERVER
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

