const pool = require("../config/db");

async function getTableReservation(req, res) {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM table_reservation ORDER BY created_at DESC"
        );

        return res.status(200).json(rows); // ✅ send rows as JSON response
    } catch (error) {
        console.error("GetTableReservation error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

module.exports = getTableReservation;
