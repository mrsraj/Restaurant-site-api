const router = require('express').Router();
router.get('/', require('../middlewares/auth.middleware'), require('../middlewares/authorize.middleware')('super_admin', 'restaurant_admin'), require('../middlewares/restaurant-scope.middleware'), require('../controllers/categories/categories.controller').list);
module.exports = router;
