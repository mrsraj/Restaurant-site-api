// const getMenu = require("../models/menuModel");

// const getMenuController = async (req, res) => {
//   try {
//     const menu = await getMenu();

//     res.status(200).json({
//       success: true,
//       data: menu
//     });

//   } catch (error) {
//     console.error("Error in getMenuController:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch menu"
//     });
//   }
// };

// module.exports = getMenuController;


const getMenu = require("../models/menuModel");
const { redisClient } = require("../config/redis");

const getMenuController = async (req, res) => {
  try {
    // Check Redis cache first
    const cachedMenu = await redisClient.get("menu");

    if (cachedMenu) {
      console.log("Menu fetched from Redis");

      return res.status(200).json({
        success: true,
        data: JSON.parse(cachedMenu),
        source: "cache",
      });
    }

    // Fetch from database if not found in Redis
    console.log("Menu fetched from database");

    const menu = await getMenu();

    // Store menu in Redis for 1 hour
    await redisClient.setEx(
      "menu",
      3600,
      JSON.stringify(menu)
    );

    return res.status(200).json({
      success: true,
      data: menu,
      source: "database",
    });

  } catch (error) {
    console.error("Error in getMenuController:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch menu",
    });
  }
};

module.exports = getMenuController;
