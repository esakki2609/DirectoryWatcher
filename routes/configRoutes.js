import express from "express";
const router = express.Router();
import ConfigController from "../controllers/configController.js";

// Define routes
router.get("/", ConfigController.getAllDirectory);
router.get("/:id", ConfigController.getDirectory);
router.post("/", ConfigController.createDirectory);
router.put("/update", ConfigController.updateDirectory);

router.post("/:dirId/createFile", ConfigController.createFile);
router.delete("/:dirId/deleteFile/:id", ConfigController.deleteFile);

export default router;
