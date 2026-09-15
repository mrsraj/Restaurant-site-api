module.exports = require('./table-model')({
  "table": "roles",
  "primaryKey": "id",
  "columns": [
    "id",
    "role_id",
    "name",
    "description",
    "created_at",
    "isActive"
  ]
});
