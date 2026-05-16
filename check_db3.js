import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const User = (await import("./models/User.model.js")).default;
    const users = await User.find({ role: "user" });
    for (const u of users) {
      console.log(`User ${u.username}: websiteUrl = ${u.websiteUrl}, apiKey = ${u.apiKey}`);
    }
    process.exit(0);
  });
