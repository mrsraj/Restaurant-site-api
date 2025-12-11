const express = require('express');
const router = express.Router();

const getMenu = require("../controllers/menuController");
const setMenu = require("../controllers/CreateCategoryMenu")
const deleteMenu = require("../controllers/DeleteMenuController");

const authenticate = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

router.get("/menu", getMenu);
router.post("/menu/additem", authenticate, authorizeRoles('admin'), setMenu);
router.delete("/menu/delete/:id", authenticate, authorizeRoles('admin'), deleteMenu);

module.exports = router;
