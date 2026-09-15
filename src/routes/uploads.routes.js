const router = require('express').Router();
router.post('/', require('../middlewares/auth.middleware'), require('../middlewares/authorize.middleware')('super_admin', 'restaurant_admin'), require('../middlewares/restaurant-scope.middleware'), require('../middlewares/upload.middleware').single('image'), require('../controllers/uploads/uploads.controller').create);
module.exports = router;
