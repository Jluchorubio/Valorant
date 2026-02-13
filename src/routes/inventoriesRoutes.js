const express = require("express");
const inventoriesController = require("../controllers/inventoriesController");

const router = express.Router();

router.get("/user/:userId", inventoriesController.getInventoryByUserId);
router.get("/", inventoriesController.getAllInventories);
router.post("/:inventoryId/weapons", inventoriesController.addWeaponToInventory);
router.delete("/:inventoryId/weapons/:weaponId", inventoriesController.removeWeaponFromInventory);

module.exports = router;
