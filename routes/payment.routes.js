// Payment routes placeholder


import express from "express";
import {
  initiatePayment,
  createPaymentController,
  verifyPaymentController
} from "../controllers/payment.controller.js";

const router = express.Router();

router.get("/initiate", initiatePayment);
router.get("/create-payment", createPaymentController);
router.post("/verify-payment", verifyPaymentController);

export default router;