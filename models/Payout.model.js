import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    grossAmount: {
      type: Number,
      required: true,
    },
    commissionAmount: {
      type: Number,
      required: true,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpayTransferId: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payout", payoutSchema);
