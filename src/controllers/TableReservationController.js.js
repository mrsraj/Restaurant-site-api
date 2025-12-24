const pool = require("../config/db.js");

const createReservation = async (req, res) => {
    try {
        const {
            customer_name,
            customer_phone,
            customer_email,
            number_of_persons,
            reservation_date,
            reservation_time,
            special_request,
            user_id,
            table_no,
        } = req.body;

        // 🔎 Basic validation
        if (
            !customer_name ||
            !customer_phone ||
            !number_of_persons ||
            !reservation_date ||
            !reservation_time ||
            !user_id ||
            !table_no
        ) {
            return res.status(400).json({
                message: "Required fields are missing",
            });
        }

        // 🔁 Insert reservation
        const [result] = await pool.query(
            `
      INSERT INTO table_reservation
      (
        user_id,
        table_no,
        customer_name,
        customer_phone,
        customer_email,
        number_of_persons,
        reservation_date,
        reservation_time,
        special_request,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `,
            [
                Number(user_id),
                table_no,
                customer_name,
                customer_phone,
                customer_email || null,
                number_of_persons,
                reservation_date,
                reservation_time,
                special_request || null
            ]
        );

        return res.status(201).json({
            message: "Reservation created successfully",
            reservation_id: result.insertId,
        });
    } catch (error) {
        console.error("Create reservation error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

module.exports = createReservation;
