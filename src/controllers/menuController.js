const getMenu = require("../models/menuModel");

const getMenuController = async (req, res) => {
  try {
    const menu = await getMenu();

    res.status(200).json({
      success: true,
      data: menu
    });

  } catch (error) {
    console.error("Error in getMenuController:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch menu"
    });
  }
};

module.exports = getMenuController;