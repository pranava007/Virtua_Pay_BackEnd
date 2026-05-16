import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      default: "https://via.placeholder.com/300",
    },
    category: {
      type: String,
      default: "General",
    },
    stock: {
      type: Number,
      default: 10,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
