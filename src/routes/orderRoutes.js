const express = require('express');
const router = express.Router();

const authenticate = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');


const { placeOrder } = require("../controllers/orderController");
const OrderStatus = require("../controllers/OrderStatusController");   // ✅ ADD THIS LINE

router.post("/orders", authenticate,authorizeRoles('user'), placeOrder);
router.get("/status/:invoice_id", authenticate,authorizeRoles('user'), OrderStatus); 

module.exports = router;
