// Gateway settings controller placeholder

import GatewayConfig from "../models/GatewayConfig.model.js";

export const getGatewayConfig = async (req, res) => {
  try {
    let config = await GatewayConfig.findOne();
    if (!config) {
      config = await GatewayConfig.create({ activeGateway: "razorpay" });
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateGatewayConfig = async (req, res) => {
  try {
    const { activeGateway } = req.body;
    let config = await GatewayConfig.findOne();
    if (config) {
      config.activeGateway = activeGateway;
      await config.save();
    } else {
      config = await GatewayConfig.create({ activeGateway });
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};