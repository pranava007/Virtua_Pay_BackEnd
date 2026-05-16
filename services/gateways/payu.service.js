import crypto from "crypto";

/**
 * 🔥 PAYU INDIA INTEGRATION
 * This generates a secure payment hash and redirect URL
 */
export const payuPayment = async (amount, orderId, config = {}) => {
  const merchantKey = config.merchantKey || process.env.PAYU_MERCHANT_KEY;
  const merchantSalt = config.merchantSalt || process.env.PAYU_MERCHANT_SALT;

  if (!merchantKey || !merchantSalt) {
    throw new Error("PayU credentials (Merchant Key or Salt) are missing.");
  }

  // 1. Prepare Transaction Data
  const txnid = orderId.toString();
  const productinfo = "Order_" + txnid;
  const firstname = "Test User";
  const email = "test@virtuapay.com";

  // 2. Generate Hash (sha512)
  // Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
  const hashString = `${merchantKey}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${merchantSalt}`;
  const hash = crypto.createHash("sha512").update(hashString).digest("hex");

  console.log("[PayU] Hash generated for transaction:", txnid);

  // 3. Construct Local Redirect URL
  const localRedirectUrl = `http://localhost:7000/payment/payu/redirect/${txnid}`;

  const params = {
    key: merchantKey,
    txnid: txnid,
    amount: amount,
    productinfo: productinfo,
    firstname: firstname,
    email: email,
    hash: hash,
    surl: `http://localhost:7000/payment/payu/return`,
    furl: `http://localhost:7000/payment/payu/return`
  };

  return {
    gateway: "payu",
    amount,
    orderId: txnid,
    currency: "INR",
    paymentUrl: localRedirectUrl,
    params: params,
    actionUrl: "https://test.payu.in/_payment" // Real PayU target
  };
};

/**
 * 🔥 VERIFY PAYU PAYMENT
 */
export const verifyPayuPayment = (data, config = {}) => {
  // PayU sends back the status and a reverse hash.
  // For the demo, if PayU says 'success', we trust it.
  // In production, you MUST verify the reverse hash using the SALT.
  return data.status === "success";
};