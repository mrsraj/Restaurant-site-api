/**
 * Update reservation status
 * PUT /api/reservations/:id
 */
export const updateReservationStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatus = ["confirmed", "cancelled", "done"];

    if (!allowedStatus.includes(status)) {
        return res.status(400).json({
            message: "Invalid status value",
        });
    }

    try {
        const [result] = await pool.query(
            `
      UPDATE reservations
      SET status = ?
      WHERE id = ?
      `,
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Reservation not found",
            });
        }

        return res.json({
            message: "Reservation status updated",
        });
    } catch (error) {
        console.error("Update reservation error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
