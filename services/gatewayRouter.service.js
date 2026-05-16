import GatewayConfig from "../models/GatewayConfig.model.js";
import User from "../models/User.model.js";

import { createRazorpayOrder, verifyRazorpayPayment } from "./gateways/razorpay.service.js";
import { stripePayment } from "./gateways/stripe.service.js";
import { phonepePayment } from "./gateways/phonepe.service.js";
import { payuPayment, verifyPayuPayment } from "./gateways/payu.service.js";
import { cashfreePayment } from "./gateways/cashfree.service.js";

// 🔥 CREATE PAYMENT
export const routePayment = async (amount, orderId, identifier) => {

  // 1. Get Admin's global config (The SaaS "Master Switch")
  const admin = await User.findOne({ role: "admin" });
  let adminConfig = null;
  if (admin) {
    adminConfig = await GatewayConfig.findOne({ merchantId: admin._id });
  }

  // 2. Use Admin's config as the primary gateway for all transactions
  let config = adminConfig;

  // 3. Fallback to individual merchant config only if Admin config is missing
  if (!config) {
    config = await GatewayConfig.findOne({ 
      $or: [{ storeId: identifier }, { merchantId: identifier }] 
    });
  }

  if (!config) {
    throw new Error("Payment Gateway not configured by Admin.");
  }

  console.log(`[Gateway] Routing payment via global gateway: ${config.activeGateway}`);

  switch (config.activeGateway) {
    case "razorpay":
      return await createRazorpayOrder(amount, orderId, config.razorpay);

    case "stripe":
      return await stripePayment(amount, orderId);

    case "phonepe":
      return await phonepePayment(amount, orderId, config.phonepe);

    case "payu":
      return await payuPayment(amount, orderId, config.payu);

    case "cashfree":
      return await cashfreePayment(amount, orderId, config.cashfree);

    default:
      throw new Error("Invalid gateway");
  }
};

// 🔥 VERIFY PAYMENT
export const verifyPayment = async (paymentData, identifier) => {

  // 1. Get Admin's global config
  const admin = await User.findOne({ role: "admin" });
  let adminConfig = null;
  if (admin) {
    adminConfig = await GatewayConfig.findOne({ merchantId: admin._id });
  }

  // 2. Use Admin's config as primary
  let config = adminConfig;

  // 3. Fallback to merchant config
  if (!config) {
    config = await GatewayConfig.findOne({ 
      $or: [{ storeId: identifier }, { merchantId: identifier }] 
    });
  }
  
  if (!config) {
    throw new Error("Payment Gateway not configured by Admin.");
  }

  switch (config.activeGateway) {
    case "razorpay":
      return verifyRazorpayPayment(paymentData, config.razorpay);

    case "payu":
      return verifyPayuPayment(paymentData, config.payu);

    default:
      return false;
  }
};