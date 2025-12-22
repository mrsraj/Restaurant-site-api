const express = require('express');
const router = express.Router();

const getMenu = require("../controllers/menuController");
const setMenu = require("../controllers/CreateCategoryMenu")
const deleteMenu = require("../controllers/DeleteMenuController");
const GetCategory = require("../controllers/getCategoryController");
const adminmenu = require("../controllers/AdminMenuController")

const upload = require("../Utility/ImageUpload");
const FileUploadController = require("../controllers/FileController")

const authenticate = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const statusUpdate = require("../controllers/AdminMenuStatusUpdate");

//Menu URLs

router.get("/menu", getMenu);

router.post("/menu/additem",authenticate,authorizeRoles("admin"),upload.single("image"),setMenu);

router.post("/menu/additem", authenticate, authorizeRoles('admin'), setMenu);

router.delete("/menu/delete/:id", authenticate, authorizeRoles('admin'), deleteMenu);

router.post("/upload", FileUploadController);
router.get('/menu/categories', GetCategory);
router.get('/adminmenu',adminmenu);
router.post('/admin/status',statusUpdate);

module.exports = router;
