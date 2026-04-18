// Order model placeholder
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
  shopifyOrderId: String,
  customerName: String,
  email: String,
  amount: Number,
  items: Array,
  status: String,
  paymentId: String,
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);