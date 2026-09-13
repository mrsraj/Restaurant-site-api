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
      table_no,
    } = req.body;

    const user_id = req.user.id;
    // �o. Required fields validation (matches DB schema)
    if (
      !customer_name ||
      !customer_phone ||
      !number_of_persons ||
      !reservation_date ||
      !reservation_time ||
      !user_id
    ) {
      return res.status(400).json({
        message: "Required fields are missing",
      });
    }

    // dY"? Insert reservation
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
        restaurant_id,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `,
      [
        Number(user_id),
        table_no || null,
        customer_name,
        customer_phone,
        customer_email || null,
        Number(number_of_persons),
        reservation_date,
        reservation_time,
        special_request || null,
        req.restaurantId,
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
