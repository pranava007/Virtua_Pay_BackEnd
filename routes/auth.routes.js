// Auth routes placeholder

import express from "express";
import { installApp, authCallback , register, login, getMe  } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";


const router = express.Router();

router.get("/", installApp);
router.get("/callback", authCallback);
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

export default router;






