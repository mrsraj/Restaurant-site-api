import requireOwnedInvoice from '../services/payments/require-owned-invoice.service.js';
export default async (req, res, next) => {
  try {
    await requireOwnedInvoice(req.params.id, req.user.id);
    req.body.invoice_id = req.params.id;
    req.body.customer_id = req.user.id;
    next();
  } catch (error) { next(error); }
};
