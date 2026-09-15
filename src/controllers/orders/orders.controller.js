const handle = require('../../utils/controller');
exports.create = handle(require('../../services/orders/create.service'), 201);
exports.list = handle(require('../../services/orders/list.service'), 200);
exports.get = handle(require('../../services/orders/get.service'), 200);
exports.update = handle(require('../../services/orders/update.service'), 200);
