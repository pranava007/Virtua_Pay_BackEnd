// Admin routes placeholder

import express from "express";
import { getGatewayConfig, updateGatewayConfig } from "../controllers/admin.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// router.get("/config", protect, authorize("admin"), getGatewayConfig);
// router.patch("/config", protect, authorize("admin"), updateGatewayConfig);

router.patch("/config", updateGatewayConfig);
router.get("/config", getGatewayConfig);

export default router;