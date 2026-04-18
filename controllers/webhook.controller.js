// Shopify webhooks controller placeholder

import Order from "../models/Order.model.js";
import Store from "../models/Store.model.js";
import { routePayment } from "../services/gatewayRouter.service.js";

export const orderCreateWebhook = async (req, res) => {
  try {
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
      status: "pending",
    });

    // 🔥 Payment trigger
    const payment = await routePayment(order.amount, order._id, store._id);

    res.status(200).json({ success: true, payment });

  } catch (err) {
    res.status(500).send(err.message);
  }
};