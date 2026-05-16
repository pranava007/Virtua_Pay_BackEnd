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
router.get("/payu/redirect/:orderId", (req, res, next) => {
  // We'll import the controller in the next step
  import("../controllers/payment.controller.js").then(m => m.payuRedirectController(req, res, next));
});

router.post("/payu/return", (req, res, next) => {
  import("../controllers/payment.controller.js").then(m => m.payuReturnController(req, res, next));
});
router.get("/payu/return", (req, res, next) => {
  import("../controllers/payment.controller.js").then(m => m.payuReturnController(req, res, next));
});

export default router;