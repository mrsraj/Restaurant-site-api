module.exports = require('./table-model')({
  "table": "categories",
  "primaryKey": "id",
  "columns": [
    "id",
    "c_name",
    "description",
    "image_url",
    "is_active",
    "created_at",
    "restaurant_id"
  ]
});
