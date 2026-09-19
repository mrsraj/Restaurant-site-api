import { Router } from 'express';
import * as restaurants from '../controllers/restaurants/restaurants.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import roles from '../middlewares/authorize.middleware.js';

const router = Router();

router.use(authenticate, roles('super_admin', 'restaurant_admin'));
router.get('/', restaurants.list);
router.post('/', roles('super_admin'), restaurants.create);

export default router;
