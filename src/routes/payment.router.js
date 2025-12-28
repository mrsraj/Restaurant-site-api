const express = require("express");
const router = express.Router();

// Controllers
const createOrder = require("../controllers/Payment/PaymentController");
const verifyPayment = require("../controllers/Payment/VerifyPaymentController");
const paymentFailed = require("../controllers/Payment/UpdatePaymentFail");

// Routes
router.post("/create-order", createOrder);      
router.post("/verify-payment", verifyPayment);  
router.post("/payment-failed", paymentFailed);  

module.exports = router;
