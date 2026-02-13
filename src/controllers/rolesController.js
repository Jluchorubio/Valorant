const { pool } = require("../config/db");

async function getAllRoles(req, res, next) {
  try {
    const [rows] = await pool.query("SELECT id, name FROM roles ORDER BY id ASC");
    return res.status(200).json(rows);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAllRoles,
};
