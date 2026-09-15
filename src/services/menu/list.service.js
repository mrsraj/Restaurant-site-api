const AppError = require('../../utils/app-error');
const getMenu = require("../../models/menu.model");
module.exports = async (input = {}, context = {}) => {
  try {
    return {
      success: true,
      data: await getMenu(context.restaurantId)
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw error;
  }
};
