// OAuth controller placeholder

import { getAccessToken } from "../services/shopify.service.js";
import Store from "../models/Store.model.js";
import crypto from "crypto";


const validateHmac = (query, secret) => {
  const { hmac, ...rest } = query;

  const message = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${rest[key]}`)
    .join("&");

  const generatedHash = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("hex");

  return generatedHash === hmac;
};

export const installApp = (req, res) => {
  const { shop } = req.query;

  const url = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${process.env.SCOPES}&redirect_uri=${process.env.HOST}/auth/callback`;

  res.redirect(url);
};


export const authCallback = async (req, res) => {
  try {
    const { shop, code } = req.query;

    // ✅ HMAC validation
    const isValid = validateHmac(req.query, process.env.SHOPIFY_API_SECRET);

    if (!isValid) {
      return res.status(400).send("HMAC validation failed ❌");
    }

    if (!shop || !code) {
      return res.status(400).send("Missing shop or code ❌");
    }

    const data = await getAccessToken(shop, code);

    await Store.findOneAndUpdate(
      { shop },
      { shop, accessToken: data.access_token },
      { upsert: true }
    );

    res.send("App Installed Successfully ✅");

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};