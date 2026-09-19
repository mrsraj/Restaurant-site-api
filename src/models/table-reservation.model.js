import tableModel from './table-model.js';

export default tableModel({
  "table": "table_reservation",
  "primaryKey": "id",
  "columns": [
    "id",
    "user_id",
    "customer_name",
    "customer_phone",
    "customer_email",
    "table_no",
    "number_of_persons",
    "reservation_date",
    "reservation_time",
    "special_request",
    "status",
    "created_at",
    "restaurant_id"
  ]
});
