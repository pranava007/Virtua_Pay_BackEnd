import Order from "../models/Order.model.js";
import Store from "../models/Store.model.js";
import crypto from "crypto";

const verifyWebhook = (req) => {
  const hmac = req.headers["x-shopify-hmac-sha256"];
  const body = JSON.stringify(req.body);

  const generated = crypto
    .createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET)
    .update(body, "utf8")
    .digest("base64");

  return generated === hmac;
};

import { routePayment } from "../services/gatewayRouter.service.js";

export const orderCreateWebhook = async (req, res) => {
  try {
    if (!verifyWebhook(req)) {
      return res.status(401).send("Invalid webhook ❌");
    }

    const data = req.body;
    const shop = req.headers["x-shopify-shop-domain"];

    const store = await Store.findOne({ shop });

    const order = await Order.create({
      storeId: store._id,
      shopifyOrderId: data.id,
      email: data.email,
      customerName: data.customer?.first_name,
      amount: data.total_price,
      items: data.line_items,
      status: "pending"
    });

    // 🔥 PAYMENT CREATE
    const payment = await routePayment(
      order.amount,
      order._id,
      store._id
    );

    res.status(200).json({
      success: true,
      order,
      payment
    });

  } catch (err) {
    res.status(500).send(err.message);
  }
};