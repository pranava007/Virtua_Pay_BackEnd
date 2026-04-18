// PayU service placeholder

export const payuPayment = async (amount, orderId) => {
  return {
    gateway: "payu",
    amount,
    orderId,
    currency: "INR",
    paymentUrl: `https://secure.payu.in/_payment/${orderId}`,
  };
};