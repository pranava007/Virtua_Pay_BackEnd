import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET
});

// 🔥 CREATE ORDER
export const createRazorpayOrder = async (amount, orderId) => {
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
    key: process.env.RAZORPAY_KEY
  };
};

// 🔥 VERIFY PAYMENT
export const verifyRazorpayPayment = (data) => {
  const body = data.order_id + "|" + data.payment_id;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body)
    .digest("hex");

  return expected === data.signature;
};