import { Cashfree } from "cashfree-pg";

/**
 * 🔥 CASHFREE v5 INTEGRATION
 * This creates a real order in Cashfree Sandbox
 */
export const cashfreePayment = async (amount, orderId, config = {}) => {
  // Use config keys (from Admin dashboard) or env defaults
  const appId = config.appId || process.env.CASHFREE_APP_ID;
  const secretKey = config.secret || process.env.CASHFREE_SECRET;

  if (!appId || !secretKey) {
    throw new Error("Cashfree credentials (App ID or Secret Key) are missing.");
  }

  // 1. Initialize Cashfree (v5 SDK Syntax)
  const isSandbox = (process.env.CASHFREE_ENV || "TEST") === "TEST";
  const cashfree = new Cashfree(
    isSandbox ? Cashfree.SANDBOX : Cashfree.PRODUCTION,
    appId,
    secretKey
  );

  // 2. Prepare Order Request
  const request = {
    order_amount: amount,
    order_currency: "INR",
    order_id: orderId.toString(),
    customer_details: {
      customer_id: "TEST_USER_123",
      customer_phone: "9999999999",
      customer_email: "test@virtuapay.com"
    },
    order_meta: {
      return_url: `http://localhost:5173/payment-status?order_id={order_id}`
    }
  };

  try {
    // 3. Create Order on Cashfree Server
    const response = await cashfree.PGCreateOrder(request);
    
    console.log("[Cashfree] Real v5 order created:", response.data.order_id);

    return {
      gateway: "cashfree",
      amount: amount,
      orderId: response.data.order_id,
      currency: "INR",
      paymentUrl: response.data.payment_link
    };
  } catch (error) {
    console.error("[Cashfree Error]", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Cashfree Order Creation Failed");
  }
};