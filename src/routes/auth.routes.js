import { Router } from 'express';
import * as auth from '../controllers/auth/auth.controller.js';

const router = Router();

router.post('/sessions', auth.login);
router.post('/password-reset-requests', auth.requestPasswordReset);
router.post('/password-resets', auth.resetPassword);

export default router;
