const handle = require('../../utils/controller');
exports.createOrder = handle(require('../../services/payments/create-order.service'), 201);
exports.verify = handle(require('../../services/payments/verify.service'), 200);
exports.reportFailure = handle(require('../../services/payments/report-failure.service'), 200);
