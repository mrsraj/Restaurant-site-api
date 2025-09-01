const express = require('express');
const router = express.Router();

const userLogin = require('../controllers/LoginController');
const userRegistration = require('../controllers/UserRegistration');

// POST /auth/user/login
router.post('/user/login', userLogin);

// POST /auth/user/register
router.post('/user/register', userRegistration);

module.exports = router;
