const router = require('express').Router();
const authenticate = require('../middlewares/authMiddleware');
const roles = require('../middlewares/roleMiddleware');
const scope = require('../middlewares/restaurantScope');
router.use(authenticate);
router.post('/', roles('user'), scope, require('../controllers/TableReservationController.js.js'));
router.get('/', roles('super_admin', 'restaurant_admin', 'user'), scope, require('../controllers/getTableReservation'));
router.patch('/:id', roles('super_admin', 'restaurant_admin'), scope, require('../controllers/UpdateReservationStatus'));
module.exports = router;
