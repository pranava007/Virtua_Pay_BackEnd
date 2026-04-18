// Webhook routes placeholder

import express from "express";
import { orderCreateWebhook } from "../controllers/webhook.controller.js";

const router = express.Router();

router.post("/orders-create", orderCreateWebhook);

export default router;