
const express = require('express');
const router = express.Router();

const authenticate = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

const reservation = require('../controllers/TableReservationController.js');
const getReservation = require('../controllers/getTableReservation.js')

router.post('/reservation', reservation);
router.get('/getreserv', getReservation)

module.exports = router;