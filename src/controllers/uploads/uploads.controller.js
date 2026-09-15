const handle = require('../../utils/controller');
exports.create = handle(require('../../services/uploads/create.service'), 201);
