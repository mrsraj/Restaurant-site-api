import { Router } from 'express';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorize.middleware.js';
import scope from '../middlewares/restaurant-scope.middleware.js';
import * as categories from '../controllers/categories/categories.controller.js';

const router = Router();

router.get('/', authenticate, authorize('super_admin', 'restaurant_admin'), scope, categories.list);

export default router;
