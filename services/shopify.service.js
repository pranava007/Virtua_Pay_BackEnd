// Shopify API / token service placeholder

import axios from "axios";

export const getAccessToken = async (shop, code) => {
  const response = await axios.post(
    `https://${shop}/admin/oauth/access_token`,
    {
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    }
  );

  return response.data;
};