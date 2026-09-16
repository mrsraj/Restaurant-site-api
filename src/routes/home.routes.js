const router = require('express').Router();
router.get('/', require('../middlewares/restaurant-scope.middleware'), require('../controllers/home/home.controller').get);
module.exports = router;
