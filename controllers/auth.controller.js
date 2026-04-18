// OAuth controller placeholder

import { getAccessToken } from "../services/shopify.service.js";
import Store from "../models/Store.model.js";

export const installApp = (req, res) => {
  const { shop } = req.query;

  const url = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${process.env.SCOPES}&redirect_uri=${process.env.HOST}/auth/callback`;

  res.redirect(url);
};

export const authCallback = async (req, res) => {
  try {
    const { shop, code } = req.query;

    const data = await getAccessToken(shop, code);

    await Store.findOneAndUpdate(
      { shop },
      { shop, accessToken: data.access_token },
      { upsert: true }
    );

    res.send("App Installed Successfully ✅");
  } catch (err) {
    res.status(500).send(err.message);
  }
};