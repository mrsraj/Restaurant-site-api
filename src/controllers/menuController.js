const getMenu = require('../models/menuModel');
module.exports = async (req, res, next) => {
  try { res.json({ success: true, data: await getMenu(req.restaurantId) }); }
  catch (error) { next(error); }
};
