const handle = require('../../utils/controller');
exports.list = handle(require('../../services/restaurants/list.service'), 200);
exports.create = handle(require('../../services/restaurants/create.service'), 201);
