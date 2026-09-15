const router = require('express').Router();
const payments = require('../controllers/payments/payments.controller');
const customer = [require('../middlewares/auth.middleware'), require('../middlewares/authorize.middleware')('user')];
const ownInvoice = require('../middlewares/invoice-owner.middleware');
router.post('/payment-orders', ...customer, payments.createOrder);
router.post('/orders/:id/payment-verifications', ...customer, ownInvoice, payments.verify);
router.patch('/orders/:id/payment', ...customer, ownInvoice, payments.reportFailure);
module.exports = router;
