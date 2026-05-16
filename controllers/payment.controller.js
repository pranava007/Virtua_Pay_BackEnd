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

// 🔥 STEP 4: PayU Redirect (Bypasses 403 Forbidden)
export const payuRedirectController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    
    if (!order) return res.status(404).send("Order not found");

    // Re-route to get fresh PayU parameters
    const payment = await routePayment(
      order.amount,
      order._id,
      order.merchantId || order.storeId
    );

    if (payment.gateway !== "payu") {
      return res.status(400).send("Invalid gateway for this redirect");
    }

    // Render an auto-submitting form
    const formHtml = `
      <html>
        <body onload="document.forms[0].submit()">
          <p>Redirecting to PayU India secure payment gateway...</p>
          <form action="${payment.actionUrl}" method="POST">
            ${Object.entries(payment.params).map(([key, value]) => 
              `<input type="hidden" name="${key}" value="${value}" />`
            ).join('')}
          </form>
        </body>
      </html>
    `;

    res.send(formHtml);

  } catch (err) {
    console.error("PayU Redirect Error:", err.message);
    res.status(500).send("Payment redirection failed");
  }
};

// 🔥 STEP 5: PayU Return Handler (Updates DB & Redirects Back to Store)
export const payuReturnController = async (req, res) => {
  try {
    const data = { ...req.body, ...req.query };
    const orderId = data.txnid;
    
    console.log(`[PayU Return] Received data for order: ${orderId}, Status: ${data.status}`);

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).send("Order not found");

    // 1. Verify Status
    if (data.status === "success") {
      order.status = "paid";
      order.paymentId = data.mihpayid; // PayU Transaction ID
      await order.save();
      console.log(`[PayU Success] Order ${orderId} marked as PAID`);
    } else {
      console.warn(`[PayU Failure] Order ${orderId} failed or cancelled`);
    }

    // 2. Redirect back to the Store frontend
    // Use Port 3000 as requested by user
    res.redirect(`http://localhost:3000/payment-status?status=${data.status}&orderId=${orderId}`);

  } catch (err) {
    console.error("PayU Return Error:", err.message);
    res.redirect(`http://localhost:5173/payment-status?status=error`);
  }
};