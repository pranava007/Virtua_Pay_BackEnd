// PhonePe service placeholder

export const phonepePayment = async (amount, orderId) => {
  return {
    gateway: "phonepe",
    amount,
    orderId,
    currency: "INR",
    paymentUrl: `https://phonepe.com/pay/${orderId}`,
  };
};