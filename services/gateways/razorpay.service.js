import Razorpay from "razorpay";
import crypto from "crypto";

// 🔥 CREATE ORDER
export const createRazorpayOrder = async (amount, orderId, config = {}) => {
  const key_id = config.keyId || process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY;
  const key_secret = config.keySecret || process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET;

  const razorpay = new Razorpay({ key_id, key_secret });

  const options = {
    amount: amount * 100,
    currency: "INR",
    receipt: orderId.toString()
  };

  const order = await razorpay.orders.create(options);

  return {
    gateway: "razorpay",
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    key: key_id
  };
};

// 🔥 VERIFY PAYMENT
export const verifyRazorpayPayment = (data, config = {}) => {
  const key_secret = config.keySecret || process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET;
  
  // Razorpay sends these names in the response
  const orderId = data.razorpay_order_id || data.order_id;
  const paymentId = data.razorpay_payment_id || data.payment_id;
  const signature = data.razorpay_signature || data.signature;

  if (!orderId || !paymentId || !signature) {
    console.error("[Razorpay Verify] Missing required fields:", { orderId, paymentId, signature });
    return false;
  }

  const body = orderId + "|" + paymentId;

  const expected = crypto
    .createHmac("sha256", key_secret)
    .update(body)
    .digest("hex");

  const isValid = expected === signature;
  
  if (!isValid) {
    console.warn("[Razorpay Verify] Signature Mismatch!");
  }

  return isValid;
};