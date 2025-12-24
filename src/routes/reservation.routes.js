
const express = require('express');
const router = express.Router();

const authenticate = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

const reservation = require('../controllers/TableReservationController.js');
const getReservation = require('../controllers/getTableReservation.js');
const reservationStatus = require('../controllers/UpdateReservationStatus.js');

router.post('/reservation', reservation);
router.get('/getreserv', authenticate, authorizeRoles("admin", "user"), getReservation);
router.put('/reserveStatus', authenticate, authorizeRoles("admin"), reservationStatus);

module.exports = router;