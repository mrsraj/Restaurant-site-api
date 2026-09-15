const handle = require('../../utils/controller');
exports.register = handle(require('../../services/users/register.service'), 201);
exports.list = handle(require('../../services/users/list.service'), 200);
exports.me = (req, res) => res.json({ ...req.user, user_id: req.user.id });
