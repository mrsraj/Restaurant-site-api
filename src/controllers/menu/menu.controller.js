const handle = require('../../utils/controller');
exports.list = handle(require('../../services/menu/list.service'), 200);
exports.create = handle(require('../../services/menu/create.service'), 201);
exports.update = handle(require('../../services/menu/update.service'), 200);
exports.remove = handle(require('../../services/menu/remove.service'), 204);
exports.get = handle(require('../../services/menu/get.service'), 200);
