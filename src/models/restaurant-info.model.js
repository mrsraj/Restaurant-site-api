import tableModel from './table-model.js';

export default tableModel({
  "table": "restaurant_info",
  "primaryKey": "id",
  "columns": [
    "id",
    "restaurant_name",
    "address",
    "phone",
    "email",
    "description",
    "logo_url",
    "cover_image_url",
    "opening_time",
    "closing_time",
    "is_open",
    "is_active",
    "created_at"
  ]
});
