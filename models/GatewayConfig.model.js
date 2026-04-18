import mongoose from "mongoose";

const gatewayConfigSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    activeGateway: {
      type: String,
      enum: ["razorpay", "stripe", "phonepe", "payu", "cashfree"],
      default: "razorpay",
    },
  },
  { timestamps: true }
);

export default mongoose.model("GatewayConfig", gatewayConfigSchema);