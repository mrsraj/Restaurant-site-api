
const express = require('express');
const router = express.Router();

const authenticate = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

const reservation = require('../controllers/TableReservationController.js');
const getReservation = require('../controllers/getTableReservation.js');
const reservationStatus = require('../controllers/UpdateReservationStatus.js');

router.post('/reservation', reservation);
router.get('/getreserv', getReservation);
router.put('/reserveStatus',reservationStatus);

module.exports = router;