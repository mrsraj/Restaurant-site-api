import tableModel from './table-model.js';

export default tableModel({
  "table": "restaurants",
  "primaryKey": "id",
  "columns": [
    "id",
    "name",
    "created_at",
    "updated_at"
  ]
});
