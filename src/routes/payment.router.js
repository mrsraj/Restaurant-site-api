const router = require('express').Router();
const pool = require('../config/db');
const customer = [require('../middlewares/authMiddleware'), require('../middlewares/roleMiddleware')('user')];
async function ownInvoice(req, res, next) {
  const [rows] = await pool.query('SELECT invoice_id FROM invoice WHERE invoice_id = ? AND customer_id = ?', [req.params.id || null, req.user.id]);
  if (!rows.length) return res.status(404).json({ message: 'Invoice not found' });
  req.body.invoice_id = req.params.id;
  req.body.customer_id = req.user.id;
  next();
}
router.post('/payment-orders', ...customer, require('../controllers/Payment/PaymentController'));
router.post('/orders/:id/payment-verifications', ...customer, ownInvoice, require('../controllers/Payment/VerifyPaymentController'));
router.patch('/orders/:id/payment', ...customer, ownInvoice, require('../controllers/Payment/UpdatePaymentFail'));
module.exports = router;
