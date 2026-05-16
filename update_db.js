import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const User = (await import("./models/User.model.js")).default;
    await User.updateOne({ username: "giri" }, { websiteUrl: "http://localhost:3000/payment-status" });
    console.log("Updated websiteUrl for user giri");
    process.exit(0);
  });
