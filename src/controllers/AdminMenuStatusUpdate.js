const pool = require("../config/db");

async function MenuStatusUpdate(req, res) { 
    const { id,status } = req.body;

    try {
        const [result] = await pool.query(
            `UPDATE invoice SET status = ? WHERE invoice_id = ?`,
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        return res.status(200).json({
            message: "Invoice status updated successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Database error" });
    }
}

module.exports = MenuStatusUpdate;
