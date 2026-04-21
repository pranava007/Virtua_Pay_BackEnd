import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // ✅ ADD THIS

import authRoutes from "./routes/auth.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import adminRoutes from "./routes/admin.routes.js";

dotenv.config();

const app = express();

// ✅ CORS FIX
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://virtuapay.netlify.app"
  ],
  credentials: true
}));

app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/webhook", webhookRoutes);
app.use("/payment", paymentRoutes);
app.use("/admin", adminRoutes);


app.get("/", (req, res) => {
  res.send("Payment Gateway SaaS Running 🚀");
});

export default app;