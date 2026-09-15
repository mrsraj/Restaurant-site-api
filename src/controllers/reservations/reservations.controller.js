const handle = require('../../utils/controller');
exports.create = handle(require('../../services/reservations/create.service'), 201);
exports.list = handle(require('../../services/reservations/list.service'), 200);
exports.update = handle(require('../../services/reservations/update.service'), 200);
