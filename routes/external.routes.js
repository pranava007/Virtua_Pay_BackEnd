import express from "express";
import { 
  createExternalOrder, 
  verifyExternalPayment, 
  getExternalOrderStatus,
  getCheckoutDetails,
  initiateCheckoutPayment,
  verifyCheckoutPayment
} from "../controllers/external.controller.js";
import { apiKeyAuth } from "../middlewares/apiKeyAuth.middleware.js";

const router = express.Router();

// Merchant API Endpoints
router.post("/orders/create", apiKeyAuth, createExternalOrder);
router.post("/orders/verify", apiKeyAuth, verifyExternalPayment);
router.get("/orders/status/:orderId", apiKeyAuth, getExternalOrderStatus);

// Public Checkout Routes (No API Key needed for the end-user)
router.get("/checkout/details/:orderId", getCheckoutDetails);
router.post("/checkout/initiate/:orderId", initiateCheckoutPayment);
router.post("/checkout/verify/:orderId", verifyCheckoutPayment);

export default router;
