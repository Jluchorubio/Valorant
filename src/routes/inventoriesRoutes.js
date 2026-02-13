const express = require("express");
const inventoriesController = require("../controllers/inventoriesController");

const router = express.Router();

router.get("/user/:userId", inventoriesController.getInventoryByUserId);
router.post("/user/:userId/skins", inventoriesController.addSkinToUserInventory);
router.put("/user/:userId/skins/:inventoryWeaponId", inventoriesController.updateUserInventorySkin);
router.delete("/user/:userId/skins/:inventoryWeaponId", inventoriesController.removeSkinFromUserInventory);
router.get("/", inventoriesController.getAllInventories);
router.post("/:inventoryId/weapons", inventoriesController.addWeaponToInventory);
router.delete("/:inventoryId/weapons/:weaponId", inventoriesController.removeWeaponFromInventory);

module.exports = router;
