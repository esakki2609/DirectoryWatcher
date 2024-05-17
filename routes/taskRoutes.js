const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

// Define routes
router.get("/start/:id", taskController.startTask);
router.get("/stop/:id", taskController.stopTask);
router.get("/:id", taskController.getTaskDetails);

module.exports = router;
