const pool = require('../config/db');

const DeleteMenu = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM menu WHERE id = ?`,[id]
        );

        // If no rows affected → item not found
        console.log("result",result[0].affectedRows);
        
        if (result[0].affectedRows === 0) {
            return res.status(404).json({ message: "Menu item not found" });
        }

        res.json({ message: "Menu item deleted successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = DeleteMenu;