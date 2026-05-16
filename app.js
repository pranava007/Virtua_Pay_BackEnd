import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // ✅ ADD THIS

import authRoutes from "./routes/auth.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import productRoutes from "./routes/product.routes.js";
import externalRoutes from "./routes/external.routes.js";
import orderRoutes from "./routes/order.routes.js";
import payoutRoutes from "./routes/payout.routes.js";
import { specs, swaggerUi } from "./config/swagger.js";

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
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/auth", authRoutes);
app.use("/webhook", webhookRoutes);
app.use("/payment", paymentRoutes);
app.use("/admin", adminRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/payouts", payoutRoutes);
app.use("/api/v1/external", externalRoutes);

// Swagger Documentation
app.use("/doc", swaggerUi.serve, swaggerUi.setup(specs));

// API Spec in JSON format (for SwaggerHub/Postman)
app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(specs);
});


app.get("/", (req, res) => {
  res.send("Payment Gateway SaaS Running 🚀");
});

export default app;