const express = require("express");
const path = require("path");
const usersRoutes = require("./usersRoutes");
const weaponsRoutes = require("./weaponsRoutes");
const inventoriesRoutes = require("./inventoriesRoutes");
const adminRoutes = require("./adminRoutes");

const router = express.Router();

router.get("/", (req, res) => {
  return res.sendFile(path.join(__dirname, "..", "public", "InicioSesion.html"));
});

router.use("/api/users", usersRoutes);
router.use("/api/weapons", weaponsRoutes);
router.use("/api/inventories", inventoriesRoutes);
router.use("/api/admin", adminRoutes);

module.exports = router;
