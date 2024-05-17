const express = require("express");
const router = express.Router();
const configController = require("../controllers/configController");

// Define routes
router.get("/", configController.getAllConfigs);
router.get("/:id", configController.getConfigById);
router.post("/", configController.createConfig);
router.put("/update", configController.updateConfig);

router.post("/:configId/createFile", configController.createFile);
router.delete("/:configId/deleteFile/:id", configController.deleteFile);

module.exports = router;
