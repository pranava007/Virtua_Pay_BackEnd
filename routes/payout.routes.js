import express from "express";
import { 
  getPayoutMerchants, 
  updateMerchantPayoutConfig, 
  processPayout 
} from "../controllers/payout.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/merchants", protect, getPayoutMerchants);
router.post("/config", protect, updateMerchantPayoutConfig);
router.post("/process", protect, processPayout);

export default router;
