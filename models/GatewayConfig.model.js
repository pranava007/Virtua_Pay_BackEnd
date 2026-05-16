import mongoose from "mongoose";

const gatewayConfigSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: false,
    },
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    activeGateway: {
      type: String,
      enum: ["razorpay", "stripe", "phonepe", "payu", "cashfree"],
      default: "razorpay",
    },
    testingMerchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    razorpay: {
      keyId: String,
      keySecret: String,
    },
    cashfree: {
      appId: String,
      secret: String,
    },
    payu: {
      merchantKey: String,
      merchantSalt: String,
    },
    phonepe: {
      merchantId: String,
      saltKey: String,
      saltIndex: String,
    },
    commissionPercentage: {
      type: Number,
      default: 5,
    },
  },
  { timestamps: true }
);

export default mongoose.model("GatewayConfig", gatewayConfigSchema);