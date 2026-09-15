const router = require('express').Router();
const auth = require('../controllers/auth/auth.controller');
router.post('/sessions', auth.login);
router.post('/password-reset-requests', auth.requestPasswordReset);
router.post('/password-resets', auth.resetPassword);
module.exports = router;
