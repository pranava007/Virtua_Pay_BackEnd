import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const User = (await import("./models/User.model.js")).default;
    const GatewayConfig = (await import("./models/GatewayConfig.model.js")).default;

    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      console.log("No admin found");
    } else {
      console.log("Admin found:", admin._id);
      const config = await GatewayConfig.findOne({ merchantId: admin._id });
      if (config) {
        console.log("Gateway config:", JSON.stringify(config, null, 2));
      } else {
        console.log("No gateway config found for admin");
      }
    }
    process.exit(0);
  });
