const handle = require('../../utils/controller');
exports.list = handle(require('../../services/categories/list.service'), 200);
