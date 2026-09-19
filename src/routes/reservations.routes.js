import { Router } from 'express';
import * as reservations from '../controllers/reservations/reservations.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import roles from '../middlewares/authorize.middleware.js';
import scope from '../middlewares/restaurant-scope.middleware.js';

const router = Router();

router.use(authenticate);
router.post('/', roles('user'), scope, reservations.create);
router.get('/', roles('super_admin', 'restaurant_admin'), scope, reservations.list);
router.patch('/:id', roles('super_admin', 'restaurant_admin'), scope, reservations.update);

export default router;
