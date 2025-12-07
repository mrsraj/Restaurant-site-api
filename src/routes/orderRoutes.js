const express = require('express');
const router = express.Router();

const { placeOrder } = require("../controllers/orderController");
const OrderStatus = require("../controllers/OrderStatusController");   // ✅ ADD THIS LINE

router.post("/orders", placeOrder);
router.get("/status/:invoice_id", OrderStatus);  // ✅ use GET

module.exports = router;
