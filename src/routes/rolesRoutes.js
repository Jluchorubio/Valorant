const express = require("express");
const rolesController = require("../controllers/rolesController");

const router = express.Router();

router.get("/", rolesController.getAllRoles);

module.exports = router;
