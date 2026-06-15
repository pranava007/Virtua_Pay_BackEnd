import { routePayment, verifyPayment } from "../services/gatewayRouter.service.js";
import Order from "../models/Order.model.js";
import User from "../models/User.model.js";
import GatewayConfig from "../models/GatewayConfig.model.js";

/**
 * @swagger
 * /api/v1/external/orders/create:
 *   post:
 *     summary: Create a new order (Merchant API)
 *     description: Creates a new order and returns a checkout URL. Requires `x-api-key` in header.
 *     tags: [Merchant API]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - customerName
 *               - email
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 500
 *               customerName:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 orderId:
 *                   type: string
 *                 checkoutUrl:
 *                   type: string
 */
export const createExternalOrder = async (req, res) => {
  try {
    const { amount, customerName, email, items } = req.body;
    const merchantId = req.user._id;

    // 1. Create order record in our DB
    const order = await Order.create({
      storeId: null,
      customerName,
      email,
      amount,
      items,
      status: "pending",
      merchantId: merchantId,
      returnUrl: req.user.websiteUrl // Always use merchant's pre-registered URL from VirtuaPay dashboard
    });

    // 2. Return the hosted checkout URL
    // In production, use process.env.FRONTEND_URL
    const frontendUrl = process.env.FRONTEND_URL;
    const checkoutUrl = `${frontendUrl}/checkout/${order._id}`;

    res.status(201).json({
      success: true,
      orderId: order._id,
      checkoutUrl
    });

  } catch (err) {
    console.error("External Order Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/v1/external/checkout/details/{orderId}:
 *   get:
 *     summary: Get order details for checkout
 *     tags: [Public Checkout]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details fetched
 */
export const getCheckoutDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Get the Admin's active gateway config
    const admin = await User.findOne({ role: "admin" });
    const config = await GatewayConfig.findOne({ merchantId: admin._id });

    console.log("Config:", config);
    console.log("RAZORPAY_KEY_ID =", process.env.RAZORPAY_KEY_ID);
    console.log("RAZORPAY_KEY =", process.env.RAZORPAY_KEY);


    if (!config) {
      return res.status(400).json({ error: "Payment gateway not configured by Admin" });
    }

    res.json({
      success: true,
      order: {
        id: order._id,
        amount: order.amount,
        customerName: order.customerName,
        email: order.email,
        items: order.items
      },
      gateway: config.activeGateway,
      // Only send necessary public info (like keyId for Razorpay)
      gatewayConfig: {
        razorpayKey: config.razorpay?.keyId || process.env.RAZORPAY_KEY_ID,
        cashfreeEnv: process.env.CASHFREE_ENV || "TEST"
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/v1/external/checkout/initiate/{orderId}:
 *   post:
 *     summary: Initiate payment for an order
 *     tags: [Public Checkout]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment initiated
 */
export const initiateCheckoutPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Use the routePayment service which already respects Admin's active gateway
    const payment = await routePayment(order.amount, order._id, order.merchantId);

    res.json({
      success: true,
      payment
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/v1/external/orders/verify:
 *   post:
 *     summary: Verify payment (Merchant)
 *     tags: [Merchant API]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Payment verified
 */
export const verifyExternalPayment = async (req, res) => {
  try {
    const { orderId, paymentData } = req.body;
    const merchantId = req.user._id;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // 1. Use the Unified Gateway Verifier
    const isValid = await verifyPayment(paymentData, merchantId);

    if (isValid) {
      order.status = "paid";
      // Try to extract a payment ID if available
      order.paymentId = paymentData.razorpay_payment_id || paymentData.mihpayid || paymentData.cf_payment_id;
      await order.save();
      
      return res.json({ 
        success: true, 
        message: "Payment verified",
        returnUrl: order.returnUrl 
      });
    }

    res.status(400).json({ success: false, message: "Invalid payment data or signature" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/v1/external/checkout/verify/{orderId}:
 *   post:
 *     summary: Verify payment (Public)
 *     tags: [Public Checkout]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Payment verified
 */
export const verifyCheckoutPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentData } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // 1. Use the Unified Gateway Verifier
    const isValid = await verifyPayment(paymentData, order.merchantId);

    if (isValid) {
      order.status = "paid";
      // Try to extract a payment ID if available
      order.paymentId = paymentData.razorpay_payment_id || paymentData.mihpayid || paymentData.cf_payment_id;
      await order.save();
      
      // Append orderId so the merchant's frontend knows which order was completed
      const finalReturnUrl = order.returnUrl 
        ? `${order.returnUrl}${order.returnUrl.includes('?') ? '&' : '?'}orderId=${order._id}`
        : null;

      return res.json({ 
        success: true, 
        message: "Payment verified",
        returnUrl: finalReturnUrl 
      });
    }

    res.status(400).json({ success: false, message: "Invalid payment data or signature" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
/**
 * @swagger
 * /api/v1/external/orders/status/{orderId}:
 *   get:
 *     summary: Get order status (Merchant)
 *     tags: [Merchant API]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order status fetched
 */
export const getExternalOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const merchantId = req.user._id;

    const order = await Order.findOne({ _id: orderId, merchantId });
    if (!order) return res.status(404).json({ error: "Order not found or access denied" });

    res.json({
      success: true,
      status: order.status,
      paymentId: order.paymentId
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
