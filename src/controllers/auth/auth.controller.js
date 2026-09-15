const handle = require('../../utils/controller');
exports.login = handle(require('../../services/auth/login.service'), 201);
exports.requestPasswordReset = handle(require('../../services/auth/request-password-reset.service'), 200);
exports.resetPassword = handle(require('../../services/auth/reset-password.service'), 200);
