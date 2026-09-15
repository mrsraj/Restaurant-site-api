const router = require('express').Router();
const staff = require('../controllers/staff/staff.controller');
router.use(require('../middlewares/auth.middleware'), require('../middlewares/authorize.middleware')('super_admin', 'restaurant_admin'));
router.get('/', staff.list);
router.post('/', staff.create);
module.exports = router;
