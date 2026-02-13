const express = require("express");
const weaponsController = require("../controllers/weaponsController");
const { requireAuth, authorizeRoles } = require("../config/authMiddleware");

const router = express.Router();

router.use(requireAuth, authorizeRoles("admin"));

router.get("/", weaponsController.getAllWeapons);
router.get("/:id", weaponsController.getWeaponById);
router.post("/", weaponsController.createWeapon);
router.put("/:id", weaponsController.updateWeapon);
router.delete("/:id", weaponsController.deleteWeapon);

module.exports = router;
