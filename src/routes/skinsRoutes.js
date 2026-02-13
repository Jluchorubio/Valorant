const express = require("express");
const skinsController = require("../controllers/skinsController");

const router = express.Router();

router.get("/catalog", skinsController.getPublicSkinsCatalog);
router.get("/", skinsController.getAllSkins);
router.get("/:id", skinsController.getSkinById);
router.post("/", skinsController.createSkin);
router.put("/:id", skinsController.updateSkin);
router.delete("/:id", skinsController.deleteSkin);

module.exports = router;
