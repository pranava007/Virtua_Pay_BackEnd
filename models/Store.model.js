// Shopify store info model placeholder

import mongoose from "mongoose";

const storeSchema = new mongoose.Schema({
  shop: String,
  accessToken: String,
}, { timestamps: true });

export default mongoose.model("Store", storeSchema);