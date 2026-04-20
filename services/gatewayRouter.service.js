import GatewayConfig from "../models/GatewayConfig.model.js";

import { createRazorpayOrder, verifyRazorpayPayment } from "./gateways/razorpay.service.js";
import { stripePayment } from "./gateways/stripe.service.js";
import { phonepePayment } from "./gateways/phonepe.service.js";
import { payuPayment } from "./gateways/payu.service.js";
import { cashfreePayment } from "./gateways/cashfree.service.js";

// 🔥 CREATE PAYMENT
export const routePayment = async (amount, orderId, storeId) => {

  const config = await GatewayConfig.findOne({ storeId });

  if (!config) throw new Error("No gateway config found");

  switch (config.activeGateway) {

    case "razorpay":
      return await createRazorpayOrder(amount, orderId);

    case "stripe":
      return await stripePayment(amount, orderId);

    case "phonepe":
      return await phonepePayment(amount, orderId);

    case "payu":
      return await payuPayment(amount, orderId);

    case "cashfree":
      return await cashfreePayment(amount, orderId);

    default:
      throw new Error("Invalid gateway");
  }
};

// 🔥 VERIFY PAYMENT
export const verifyPayment = async (paymentData, storeId) => {

  const config = await GatewayConfig.findOne({ storeId });

  if (!config) throw new Error("No gateway config found");

  switch (config.activeGateway) {

    case "razorpay":
      return verifyRazorpayPayment(paymentData);

    default:
      return false;
  }
};