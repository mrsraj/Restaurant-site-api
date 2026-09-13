const pool = require("../config/db");

async function getTableReservation(req, res) {
    try {
        const [rows] = await pool.query(
            req.user.role === 'user'
              ? "SELECT * FROM table_reservation WHERE user_id = ? ORDER BY created_at DESC"
              : "SELECT * FROM table_reservation WHERE restaurant_id = ? ORDER BY created_at DESC",
            [req.user.role === 'user' ? req.user.id : req.restaurantId]
        );

        return res.status(200).json(rows); // �o. send rows as JSON response
    } catch (error) {
        console.error("GetTableReservation error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

module.exports = getTableReservation;
