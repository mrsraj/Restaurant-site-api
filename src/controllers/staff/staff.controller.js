const handle = require('../../utils/controller');
exports.list = handle(require('../../services/staff/list.service'), 200);
exports.create = handle(require('../../services/staff/create.service'), 201);
