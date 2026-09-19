import { Router } from 'express';
import scope from '../middlewares/restaurant-scope.middleware.js';
import * as home from '../controllers/home/home.controller.js';

const router = Router();

router.get('/', scope, home.get);

export default router;
