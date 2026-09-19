import AppError from '../../utils/app-error.js';
import getMenu from '../../models/menu.model.js';
export default async (input = {}, context = {}) => {
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
