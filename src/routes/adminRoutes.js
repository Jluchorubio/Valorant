const express = require("express");
const adminController = require("../controllers/adminController");
const { requireAuth, authorizeRoles } = require("../config/authMiddleware");

const router = express.Router();

router.get("/dashboard", requireAuth, authorizeRoles("admin"), adminController.getDashboard);

module.exports = router;
