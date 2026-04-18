// Auth routes placeholder

import express from "express";
import { installApp, authCallback } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/", installApp);
router.get("/callback", authCallback);

export default router;