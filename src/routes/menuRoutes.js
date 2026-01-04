const express = require('express');
const router = express.Router();

const getMenu = require("../controllers/menuController");
const setMenu = require("../controllers/CreateCategoryMenu")
const deleteMenu = require("../controllers/DeleteMenuController");
const GetCategory = require("../controllers/getCategoryController");
const adminmenu = require("../controllers/AdminMenuController")

const upload = require("../Utility/ImageUpload");
const FileUploadController = require("../controllers/FileController/FileController");

const authenticate = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const statusUpdate = require("../controllers/AdminMenuStatusUpdate");

const updateMenuItem = require("../controllers/MenuUpdate/updateMenuItem");

//Menu URLs

router.get("/menu", getMenu);

router.post("/menu/additem", authenticate, authorizeRoles("admin"), upload.single("image"), setMenu);

// router.post("/menu/additem", authenticate, authorizeRoles('admin'), setMenu);

router.delete("/menu/delete/:id", authenticate, authorizeRoles('admin'), deleteMenu);

router.post("/upload", authenticate, authorizeRoles('admin'), FileUploadController);
router.get('/menu/categories', authenticate, authorizeRoles('admin'), GetCategory);
router.get('/adminmenu', authenticate, authorizeRoles('admin'), adminmenu);
router.post('/admin/status', authenticate, authorizeRoles('admin'), statusUpdate);

//update menu item
router.put("/update/menuitem", authenticate, upload.single("image"), updateMenuItem);

module.exports = router;
