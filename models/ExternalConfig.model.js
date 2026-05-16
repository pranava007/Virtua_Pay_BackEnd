import mongoose from "mongoose";

const externalConfigSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    baseUrl: {
      type: String,
      default: "http://localhost:8000",
    },
    apiKey: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ExternalConfig", externalConfigSchema);
