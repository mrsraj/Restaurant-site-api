import { Router } from 'express';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorize.middleware.js';
import scope from '../middlewares/restaurant-scope.middleware.js';
import upload from '../middlewares/upload.middleware.js';
import * as uploads from '../controllers/uploads/uploads.controller.js';

const router = Router();

router.post('/', authenticate, authorize('super_admin', 'restaurant_admin'), scope, upload.single('image'), uploads.create);

export default router;
