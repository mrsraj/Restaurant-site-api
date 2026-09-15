const router = require('express').Router();
const restaurants = require('../controllers/restaurants/restaurants.controller');
const roles = require('../middlewares/authorize.middleware');
router.use(require('../middlewares/auth.middleware'), roles('super_admin', 'restaurant_admin'));
router.get('/', restaurants.list);
router.post('/', roles('super_admin'), restaurants.create);
module.exports = router;
