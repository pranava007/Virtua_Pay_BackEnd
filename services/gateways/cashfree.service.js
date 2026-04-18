// Cashfree service placeholder

export const cashfreePayment = async (amount, orderId) => {
  return {
    gateway: "cashfree",
    amount,
    orderId,
    currency: "INR",
    paymentUrl: `https://payments.cashfree.com/order/${orderId}`,
  };
};