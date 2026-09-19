import tableModel from './table-model.js';

export default tableModel({
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
