const pool = require("../config/db");

const DeleteMenu = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: "Menu item ID is required",
            });
        }

        const [result] = await pool.query(
            "DELETE FROM menu WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Menu item not found",
            });
        }

        return res.json({
            success: true,
            message: "Menu item deleted successfully",
        });

    } catch (error) {
        console.error("Delete Menu Error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

module.exports = DeleteMenu;
