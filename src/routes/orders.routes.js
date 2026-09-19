import { Router } from 'express';
import * as orders from '../controllers/orders/orders.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import roles from '../middlewares/authorize.middleware.js';
import scope from '../middlewares/restaurant-scope.middleware.js';

const router = Router();

router.use(authenticate);
router.post('/', roles('user'), orders.create);
router.get('/', roles('super_admin', 'restaurant_admin', 'kitchen'), scope, orders.list);
router.get('/:id', roles('user'), orders.get);
router.patch('/:id', roles('super_admin', 'restaurant_admin', 'kitchen'), scope, orders.update);

export default router;
