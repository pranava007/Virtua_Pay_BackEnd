// Auth routes placeholder

import express from "express";
import { installApp, authCallback , register, login, getMe, getApiKey, generateApiKey, updateWebsite  } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";


const router = express.Router();

router.get("/", installApp);
router.get("/callback", authCallback);
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/api-key", protect, getApiKey);
router.post("/api-key/generate", protect, generateApiKey);
router.post("/update-website", protect, updateWebsite);

export default router;






