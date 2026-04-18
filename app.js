// App initialization placeholder
import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
// import orderRoutes from "./routes/order.routes.js";
// import paymentRoutes from "./routes/payment.routes.js";

dotenv.config();

const app = express();

app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/webhook", webhookRoutes);
// app.use("/order", orderRoutes);
// app.use("/payment", paymentRoutes);

app.get("/", (req, res) => {
  res.send("Payment Gateway SaaS Running 🚀");
});

export default app;