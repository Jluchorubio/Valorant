const express = require("express");
const authRoutes = require("./authRoutes");
const usersRoutes = require("./usersRoutes");
const weaponsRoutes = require("./weaponsRoutes");
const inventoriesRoutes = require("./inventoriesRoutes");
const adminRoutes = require("./adminRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/weapons", weaponsRoutes);
router.use("/inventories", inventoriesRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
