const router = require('express').Router();
const users = require('../controllers/users/users.controller');
const authenticate = require('../middlewares/auth.middleware');
const roles = require('../middlewares/authorize.middleware');
router.post('/', users.register);
router.get('/me', authenticate, users.me);
router.get('/', authenticate, roles('super_admin'), users.list);
module.exports = router;
