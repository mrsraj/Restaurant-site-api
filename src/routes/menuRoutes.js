const router = require('express').Router();
const scope = require('../middlewares/restaurantScope');
const authenticate = require('../middlewares/authMiddleware');
const roles = require('../middlewares/roleMiddleware');
const upload = require('../Utility/ImageUpload');
const admin = [authenticate, roles('super_admin', 'restaurant_admin'), scope];
router.get('/menu-items', scope, require('../controllers/menuController'));
router.get('/menu-items/:id', scope, async (req, res) => {
  const [rows] = await require('../config/db').query('SELECT * FROM menu WHERE id = ? AND restaurant_id = ?', [req.params.id, req.restaurantId]);
  if (!rows.length) return res.status(404).json({ message: 'Menu item not found' });
  res.json({ success: true, data: rows[0] });
});
router.post('/menu-items', ...admin, upload.single('image'), require('../controllers/CreateCategoryMenu'));
router.patch('/menu-items/:id', ...admin, upload.single('image'), require('../controllers/MenuUpdate/updateMenuItem'));
router.delete('/menu-items/:id', ...admin, require('../controllers/DeleteMenuController'));
router.get('/categories', ...admin, require('../controllers/getCategoryController'));
router.post('/uploads', ...admin, upload.single('image'), require('../controllers/FileController/FileController'));
module.exports = router;
