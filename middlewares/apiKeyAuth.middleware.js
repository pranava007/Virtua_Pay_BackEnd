import User from "../models/User.model.js";

/**
 * Middleware to authorize requests using an API Key (x-api-key header)
 */
export const apiKeyAuth = async (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({ error: "No API Key provided" });
  }

  try {
    const user = await User.findOne({ apiKey });

    if (!user) {
      return res.status(401).json({ error: "Invalid API Key" });
    }

    // Attach user (merchant) to request
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: "Authentication error" });
  }
};
