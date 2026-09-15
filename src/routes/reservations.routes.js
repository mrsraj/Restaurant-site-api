const router = require('express').Router();
const reservations = require('../controllers/reservations/reservations.controller');
const roles = require('../middlewares/authorize.middleware');
const scope = require('../middlewares/restaurant-scope.middleware');
router.use(require('../middlewares/auth.middleware'));
router.post('/', roles('user'), scope, reservations.create);
router.get('/', roles('super_admin', 'restaurant_admin', 'user'), scope, reservations.list);
router.patch('/:id', roles('super_admin', 'restaurant_admin'), scope, reservations.update);
module.exports = router;
