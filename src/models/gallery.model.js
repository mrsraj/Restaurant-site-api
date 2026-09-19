import tableModel from './table-model.js';

export default tableModel({
  "table": "gallery",
  "primaryKey": "id",
  "columns": [
    "id",
    "image_url",
    "caption",
    "created_at"
  ]
});
