
const pool = require('../config/db');

const updateReservationStatus = async (req, res) => {
    const { status } = req.body;
    const id = req.params.id;

    const allowedStatus = ["confirmed", "cancelled", "done"];

    if (!allowedStatus.includes(status)) {
        return res.status(400).json({
            message: "Invalid status value",
        });
    }

    try {
        const [result] = await pool.query(
            `UPDATE table_reservation SET status = ? WHERE id = ? AND restaurant_id = ?`,
            [status, id, req.restaurantId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Reservation not found",
            });
        }

        return res.status(200).json({
            message: "Reservation status updated",
        });

    } catch (error) {
        console.error("Update reservation error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

module.exports = updateReservationStatus;
