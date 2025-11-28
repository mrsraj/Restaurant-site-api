
require('dotenv').config();

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const mysql = require('mysql2');
const route = express.Router();
const authRoutes = require('./routes/AuthRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require("./routes/orderRoutes");


const pool = require("./config/db")

const app = express();
app.use(cors());


// // MySQL connection
// const dbconnection = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "root",  // Use .env for security in production
//     database: "restaurant_db"
// });

// // Connect to MySQL
// dbconnection.connect((err) => {
//     if (err) {
//         console.error("Not connected to database:", err.message);
//     } else {
//         console.log("Connected to MySQL database");
//     }
// });

// POST /user - create new user
const bcrypt = require('bcrypt');

app.use(express.json());
app.use('/auth', authRoutes);
app.use("/api", menuRoutes);
app.use("/api/order",orderRoutes)


app.get('/user', async (req, res) => {
    try {
        const [users] = await pool.query('SELECT * FROM users');
        res.status(200).json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

const server = http.createServer(app);

const io = socketIO(server, {
    cors: {
        origin: "*"
    }
});

io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg); // broadcast to all clients
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});



// app.get("/:id", (req, res) => {
//     const id = Number(req.params.id);
//     const newdata = data.find(item => item.id === id);

//     if (newdata) {
//         res.json(newdata);
//     } else {
//         res.status(404).json({ error: "Item not found" });
//     }
// });

// Catch-all route for undefined paths
app.use('', (req, res) => {
  res.status(404).json({ message: "Path does not exist" });
});

const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


