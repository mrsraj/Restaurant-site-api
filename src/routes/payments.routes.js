import { Router } from 'express';
import * as payments from '../controllers/payments/payments.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorize.middleware.js';
import ownInvoice from '../middlewares/invoice-owner.middleware.js';

const router = Router();
const customer = [authenticate, authorize('user')];

router.post('/payment-orders', ...customer, payments.createOrder);
router.post('/orders/:id/payment-verifications', ...customer, ownInvoice, payments.verify);
router.patch('/orders/:id/payment', ...customer, ownInvoice, payments.reportFailure);

export default router;
