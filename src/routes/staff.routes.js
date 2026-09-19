import { Router } from 'express';
import * as staff from '../controllers/staff/staff.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorize.middleware.js';
import scope from '../middlewares/restaurant-scope.middleware.js';

const router = Router();

router.use(authenticate, authorize('super_admin', 'restaurant_admin'));
router.get('/', scope, staff.list);
router.post('/', scope, staff.create);

export default router;
