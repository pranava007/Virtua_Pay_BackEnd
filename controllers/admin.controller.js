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
    console.log("BODY:", req.body);        // 👈 ADD
    console.log("USER:", req.user);        // 👈 ADD

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
    console.log("ERROR:", err); // 👈 IMPORTANT
    res.status(500).json({ error: err.message });
  }
};