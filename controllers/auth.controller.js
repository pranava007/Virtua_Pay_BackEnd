// OAuth controller placeholder

import { getAccessToken } from "../services/shopify.service.js";
import Store from "../models/Store.model.js";
import crypto from "crypto";

export const installApp = (req, res) => {
  const { shop } = req.query;

  const url = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${process.env.SCOPES}&redirect_uri=${process.env.HOST}/auth/callback`;

  res.redirect(url);
};


export const authCallback = async (req, res) => {
  try {
    const { shop, code, hmac, ...rest } = req.query;

    if (!shop || !code) {
      return res.status(400).send("Missing shop or code ❌");
    }

    // 🔥 HMAC VALIDATION
    const message = new URLSearchParams(rest).toString();

    const generatedHash = crypto
      .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
      .update(message)
      .digest("hex");

    if (generatedHash !== hmac) {
      return res.status(400).send("HMAC validation failed ❌");
    }

    const data = await getAccessToken(shop, code);

    await Store.findOneAndUpdate(
      { shop },
      { shop, accessToken: data.access_token },
      { upsert: true }
    );

    res.send("App Installed Successfully ✅");

  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).send(err.message);
  }
};