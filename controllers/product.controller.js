import Product from "../models/Product.model.js";
import ExternalConfig from "../models/ExternalConfig.model.js";
import axios from "axios";

export const getProducts = async (req, res) => {
  try {
    const extConfig = await ExternalConfig.findOne();

    if (extConfig && extConfig.isActive) {
      console.log(`Fetching products from external API: ${extConfig.baseUrl}`);
      try {
        const response = await axios.get(`${extConfig.baseUrl}/products`, {
          headers: extConfig.apiKey ? { Authorization: `Bearer ${extConfig.apiKey}` } : {}
        });
        return res.json(response.data);
      } catch (err) {
        console.error("External API Error:", err.message);
        // Fallback to local if external fails? Or just return error.
        // Let's fallback to local for robustness.
      }
    }

    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
