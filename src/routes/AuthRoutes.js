const express = require('express');
const router = express.Router();

const userLogin = require('../controllers/LoginController');
const userRegistration = require('../controllers/UserRegistration');

const authenticate = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

// POST /auth/user/login
router.post('/user/login', userLogin);

// POST /auth/user/register
router.post('/user/register', userRegistration);

router.get('/user', authenticate, authorizeRoles('user', 'admin'), (req, res) => {
    res.json({ message: 'Hello user!' });
});

router.get('/admin', authenticate, authorizeRoles('admin'), (req, res) => {
    res.json({ message: 'Hello Admin!' });
});

module.exports = router;
