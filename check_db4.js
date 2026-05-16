import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const Order = (await import("./models/Order.model.js")).default;
    const orders = await Order.find().sort("-createdAt").limit(5);
    for (const o of orders) {
      console.log(`VirtuaPay Order ${o._id}: status = ${o.status}, returnUrl = ${o.returnUrl}`);
    }
    process.exit(0);
  });
