import express from "express";
const router = express.Router();
import TaskController from "../controllers/taskController.js";

// Define routes
router.get("/start/:id", TaskController.startTask);
router.get("/stop/:id", TaskController.stopTask);
router.get("/:id", TaskController.getTaskDetails);

export default router;
