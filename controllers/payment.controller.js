import Order from "../models/Order.model.js";
import Store from "../models/Store.model.js";
import { routePayment, verifyPayment } from "../services/gatewayRouter.service.js";

// 🔥 STEP 1: Shopify → call this
export const initiatePayment = async (req, res) => {
  try {
    const { orderId, shop } = req.query;

    const store = await Store.findOne({ shop });
    const order = await Order.findById(orderId);

    // 🔥 create payment based on gateway
    const payment = await routePayment(
      order.amount,
      order._id,
      store._id
    );

    // 🔥 redirect to frontend
    res.redirect(
      `${process.env.FRONTEND_URL}/pay?orderId=${order._id}&shop=${shop}`
    );

  } catch (err) {
    res.status(500).send(err.message);
  }
};


// 🔥 STEP 2: frontend calls this
export const createPaymentController = async (req, res) => {
  try {
    const { orderId } = req.query;

    const order = await Order.findById(orderId);

    const payment = await routePayment(
      order.amount,
      order._id,
      order.storeId
    );

    res.json({
      success: true,
      payment
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🔥 STEP 3: verify payment
export const verifyPaymentController = async (req, res) => {
  try {
    const { orderId, shop, paymentData } = req.body;

    const order = await Order.findById(orderId);

    const isValid = await verifyPayment(
      paymentData,
      order.gateway
    );

    if (!isValid) {
      return res.status(400).json({ success: false });
    }

    await Order.findByIdAndUpdate(orderId, {
      status: "paid"
    });

    // 🔥 return back to Shopify
    const returnUrl = `https://${shop}/checkout/complete`;

    res.json({
      success: true,
      returnUrl
    });

  } catch (err) {
    res.status(500).send(err.message);
  }
};