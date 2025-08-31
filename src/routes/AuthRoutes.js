
const express = require('express');
const router = express.Router();
const userLogin = require('../controllers/LoginController');

router.post('/login', userLogin);

module.exports = router;
