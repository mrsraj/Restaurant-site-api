const express = require("express");
const router = express.Router();

// Controllers
const createOrder = require("../controllers/Payment/PaymentController");
const verifyPayment = require("../controllers/Payment/VerifyPaymentController");

// Routes
router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);

module.exports = router;
