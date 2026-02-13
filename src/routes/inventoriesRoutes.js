const express = require("express");
const inventoriesController = require("../controllers/inventoriesController");
const { requireAuth, authorizeRoles } = require("../config/authMiddleware");

const router = express.Router();

router.get("/me", requireAuth, authorizeRoles("user", "admin"), inventoriesController.getMyInventory);

router.get("/", requireAuth, authorizeRoles("admin"), inventoriesController.getAllInventories);
router.post(
  "/:inventoryId/weapons",
  requireAuth,
  authorizeRoles("admin"),
  inventoriesController.addWeaponToInventory
);
router.delete(
  "/:inventoryId/weapons/:weaponId",
  requireAuth,
  authorizeRoles("admin"),
  inventoriesController.removeWeaponFromInventory
);

module.exports = router;
