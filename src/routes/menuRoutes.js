const express = require('express');
const router = express.Router();

const getMenu = require("../controllers/menuController");
const SetCategories = require("../controllers/setCategoryController");
const setMenu = require("../controllers/setMenuController")

router.get("/menu", getMenu);
router.post("/menu/categories", SetCategories);
router.post("/menu/setitems", setMenu);

module.exports = router;
