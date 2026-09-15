const AppError = require('../../utils/app-error');
const pool = require("../../config/db");
const createReservation = async (input = {}, context = {}) => {
  try {
    const {
      customer_name,
      customer_phone,
      customer_email,
      number_of_persons,
      reservation_date,
      reservation_time,
      special_request,
      table_no
    } = input;
    const user_id = context.user.id;
    if (!customer_name || !customer_phone || !number_of_persons || !reservation_date || !reservation_time || !user_id) {
      throw new AppError(400, {
        message: "Required fields are missing"
      });
    }
    const [result] = await pool.query(`
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
      `, [Number(user_id), table_no || null, customer_name, customer_phone, customer_email || null, Number(number_of_persons), reservation_date, reservation_time, special_request || null, context.restaurantId]);
    return {
      message: "Reservation created successfully",
      reservation_id: result.insertId
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Create reservation error:", error);
    throw new AppError(500, {
      message: "Internal server error"
    });
  }
};
module.exports = createReservation;
