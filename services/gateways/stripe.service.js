// Stripe service placeholder

export const stripePayment = async (amount, orderId) => {
  return {
    gateway: "stripe",
    amount,
    orderId,
    currency: "INR",
    paymentUrl: `https://checkout.stripe.com/pay/${orderId}`,
  };
};