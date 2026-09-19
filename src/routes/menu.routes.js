import { Router } from 'express';
import * as menu from '../controllers/menu/menu.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import roles from '../middlewares/authorize.middleware.js';
import scope from '../middlewares/restaurant-scope.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = Router();
const admin = [authenticate, roles('super_admin', 'restaurant_admin'), scope];

router.get('/', scope, menu.list);
router.get('/:id', scope, menu.get);
router.post('/', ...admin, upload.single('image'), menu.create);
router.patch('/:id', ...admin, upload.single('image'), menu.update);
router.delete('/:id', ...admin, menu.remove);

export default router;
