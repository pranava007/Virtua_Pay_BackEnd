// Razorpay service placeholder
export const razorpayPayment = async (amount, orderId) => {
  return {
    gateway: "razorpay",
    amount,
    orderId,
    currency: "INR",
    paymentUrl: `https://rzp.io/l/${orderId}`,
  };
};