const express = require("express");
const weaponsController = require("../controllers/weaponsController");

const router = express.Router();

router.get("/catalog", weaponsController.getPublicWeaponsCatalog);
router.get("/", weaponsController.getAllWeapons);
router.get("/:id", weaponsController.getWeaponById);
router.post("/", weaponsController.createWeapon);
router.put("/:id", weaponsController.updateWeapon);
router.delete("/:id", weaponsController.deleteWeapon);

module.exports = router;
