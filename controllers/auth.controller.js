// OAuth controller placeholder

import { getAccessToken } from "../services/shopify.service.js";
import Store from "../models/Store.model.js";
import crypto from "crypto";

import User from "../models/User.model.js";
import jwt from "jsonwebtoken";


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



const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      role: user.role   // 🔥 ADD THIS
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        // token: generateToken(user._id),
          token: generateToken(user), // ✅
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        // token: generateToken(user._id),
          token: generateToken(user), // ✅

      });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


