const express = require('express');
const router = express.Router();

const getMenuController = require("../controllers/menuController");



router.get("/menu", getMenuController);

module.exports = router;
