const { pool } = require("../config/db");

async function getDashboard(req, res, next) {
  try {
    const [[usersCount]] = await pool.query("SELECT COUNT(*) AS total_users FROM users");
    const [[inventoriesCount]] = await pool.query(
      "SELECT COUNT(*) AS total_inventories FROM inventories"
    );
    const [[weaponsCount]] = await pool.query("SELECT COUNT(*) AS total_weapons FROM weapons");
    const [[inventoryWeaponsCount]] = await pool.query(
      "SELECT COUNT(*) AS total_inventory_weapons FROM inventory_weapons"
    );

    return res.status(200).json({
      users: usersCount.total_users,
      inventories: inventoriesCount.total_inventories,
      weapons: weaponsCount.total_weapons,
      inventory_weapons: inventoryWeaponsCount.total_inventory_weapons,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getDashboard,
};
