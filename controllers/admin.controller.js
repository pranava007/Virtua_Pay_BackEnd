// Gateway settings controller placeholder

import GatewayConfig from "../models/GatewayConfig.model.js";
import ExternalConfig from "../models/ExternalConfig.model.js";
import Order from "../models/Order.model.js";
import User from "../models/User.model.js";

export const getGatewayConfig = async (req, res) => {
  try {
    let config = await GatewayConfig.findOne({ merchantId: req.user.id });
    if (!config) {
      config = await GatewayConfig.create({ activeGateway: "razorpay", merchantId: req.user.id });
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateGatewayConfig = async (req, res) => {
  try {
    const { activeGateway, testingMerchantId, commissionPercentage, razorpay, cashfree, payu, phonepe } = req.body;

    let config = await GatewayConfig.findOne({ merchantId: req.user.id });

    if (config) {
      if (activeGateway) config.activeGateway = activeGateway;
      if (testingMerchantId !== undefined) config.testingMerchantId = testingMerchantId;
      if (commissionPercentage !== undefined) config.commissionPercentage = commissionPercentage;
      if (razorpay) config.razorpay = razorpay;
      if (cashfree) config.cashfree = cashfree;
      if (payu) config.payu = payu;
      if (phonepe) config.phonepe = phonepe;
      await config.save();
    } else {
      config = await GatewayConfig.create({
        activeGateway,
        testingMerchantId,
        commissionPercentage,
        razorpay,
        cashfree,
        payu,
        phonepe,
        merchantId: req.user.id,
      });
    }

    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getExternalConfig = async (req, res) => {
  try {
    let config = await ExternalConfig.findOne({ merchantId: req.user.id });
    if (!config) {
      config = await ExternalConfig.create({ merchantId: req.user.id });
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateExternalConfig = async (req, res) => {
  try {
    const { baseUrl, apiKey, isActive } = req.body;
    let config = await ExternalConfig.findOne({ merchantId: req.user.id });

    if (config) {
      if (baseUrl !== undefined) config.baseUrl = baseUrl;
      if (apiKey !== undefined) config.apiKey = apiKey;
      if (isActive !== undefined) config.isActive = isActive;
      await config.save();
    } else {
      config = await ExternalConfig.create({ baseUrl, apiKey, isActive, merchantId: req.user.id });
    }

    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMerchantStats = async (req, res) => {
  try {
    const merchants = await User.find({ 
      role: "user", 
      $or: [
        { adminId: req.user.id },
        { adminId: null }
      ]
    }).select("-password");

    const stats = await Promise.all(merchants.map(async (merchant) => {
      const now = new Date();
      const startOfDay = new Date(now.setHours(0,0,0,0));
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      const aggregateRevenue = async (startDate) => {
        const result = await Order.aggregate([
          { 
            $match: { 
              merchantId: merchant._id, 
              status: { $in: ["completed", "paid"] },
              createdAt: { $gte: startDate }
            } 
          },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        return result[0]?.total || 0;
      };

      const daily = await aggregateRevenue(startOfDay);
      const weekly = await aggregateRevenue(startOfWeek);
      const monthly = await aggregateRevenue(startOfMonth);
      const yearly = await aggregateRevenue(startOfYear);

      // Overall stats
      const overallResult = await Order.aggregate([
        { $match: { merchantId: merchant._id, status: { $in: ["completed", "paid"] } } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
      ]);
      const overall = overallResult[0] || { total: 0, count: 0 };

      return {
        _id: merchant._id,
        username: merchant.username,
        email: merchant.email,
        hasApiKey: !!merchant.apiKey,
        revenue: {
          daily,
          weekly,
          monthly,
          yearly,
          overall: overall.total
        },
        orders: overall.count,
        joinedAt: merchant.createdAt
      };
    }));

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMerchantStatsForSelf = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const now = new Date();
    const startOfDay = new Date(now.setHours(0,0,0,0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const aggregateRevenue = async (startDate) => {
      const result = await Order.aggregate([
        { 
          $match: { 
            merchantId: merchantId, 
            status: { $in: ["completed", "paid"] },
            createdAt: { $gte: startDate }
          } 
        },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      return result[0]?.total || 0;
    };

    const daily = await aggregateRevenue(startOfDay);
    const weekly = await aggregateRevenue(startOfWeek);
    const monthly = await aggregateRevenue(startOfMonth);
    const yearly = await aggregateRevenue(startOfYear);

    const overallResult = await Order.aggregate([
      { $match: { merchantId: merchantId, status: { $in: ["completed", "paid"] } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);
    const overall = overallResult[0] || { total: 0, count: 0 };

    res.json({
      revenue: {
        daily,
        weekly,
        monthly,
        yearly,
        overall: overall.total
      },
      orders: overall.count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};