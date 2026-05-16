import User from "../models/User.model.js";
import Payout from "../models/Payout.model.js";
import Order from "../models/Order.model.js";
import GatewayConfig from "../models/GatewayConfig.model.js";

export const getPayoutMerchants = async (req, res) => {
  try {
    const merchants = await User.find({ 
      role: "user", 
      $or: [
        { adminId: req.user.id },
        { adminId: null }
      ]
    }).select("username email payoutConfig");

    const adminConfig = await GatewayConfig.findOne({ merchantId: req.user.id });
    const commission = adminConfig?.commissionPercentage || 5;

    const stats = await Promise.all(merchants.map(async (merchant) => {
      const orders = await Order.find({ 
        merchantId: merchant._id, 
        status: { $in: ["completed", "paid"] } 
      });

      const totalGross = orders.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      
      const previousPayouts = await Payout.find({ 
        merchantId: merchant._id, 
        status: "completed" 
      });
      const totalPaid = previousPayouts.reduce((acc, curr) => acc + (curr.grossAmount || 0), 0);

      const pendingGross = totalGross - totalPaid;
      const commissionAmt = (pendingGross * commission) / 100;
      const netPayout = pendingGross - commissionAmt;

      return {
        _id: merchant._id,
        username: merchant.username,
        email: merchant.email,
        payoutConfig: merchant.payoutConfig,
        totalGross,
        totalPaid,
        pendingGross,
        commissionAmt,
        netPayout,
      };
    }));

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateMerchantPayoutConfig = async (req, res) => {
  try {
    const { merchantId, razorpay } = req.body;
    const merchant = await User.findById(merchantId);
    if (!merchant) return res.status(404).json({ error: "Merchant not found" });

    merchant.payoutConfig = { razorpay };
    await merchant.save();

    res.json({ success: true, message: "Payout configuration updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const processPayout = async (req, res) => {
  try {
    const { merchantId, amount } = req.body;
    
    // In a real app, you would use merchant.payoutConfig.razorpay keys here 
    // to actually trigger a Razorpay Payout.
    // For now, we record it as completed.

    const adminConfig = await GatewayConfig.findOne({ merchantId: req.user.id });
    const commission = adminConfig?.commissionPercentage || 5;

    const commissionAmt = (amount * commission) / 100;
    const netAmount = amount - commissionAmt;

    const payout = await Payout.create({
      merchantId,
      adminId: req.user.id,
      grossAmount: amount,
      commissionAmount: commissionAmt,
      netAmount: netAmount,
      status: "completed",
    });

    res.json({ success: true, payout });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
