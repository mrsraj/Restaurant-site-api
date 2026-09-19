import { Router } from 'express';
import * as users from '../controllers/users/users.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import roles from '../middlewares/authorize.middleware.js';

const router = Router();

router.post('/', users.register);
router.get('/me', authenticate, users.me);
router.get('/', authenticate, roles('super_admin'), users.list);

export default router;
