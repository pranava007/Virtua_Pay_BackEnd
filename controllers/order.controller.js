import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js";
import { routePayment } from "../services/gatewayRouter.service.js";

export const createOrder = async (req, res) => {
  try {
    const { productId, customerName, email, quantity = 1 } = req.body;

    // 1. Get Product Details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const totalAmount = product.price * quantity;

    // 2. Create Order record
    // For storefront orders, we use the admin as the merchantId (since admin owns the store)
    // In a real multi-tenant app, this would be the store's owner.
    const order = await Order.create({
      customerName,
      email,
      amount: totalAmount,
      items: [{
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity
      }],
      status: "pending",
      merchantId: req.user._id // The person creating the order (might be the user themselves)
    });

    // 3. Route payment using the merchant's active gateway
    // We pass merchantId so it can find the right GatewayConfig
    const payment = await routePayment(totalAmount, order._id, req.user._id);

    res.status(201).json({
      success: true,
      order,
      payment
    });

  } catch (err) {
    console.error("Order Creation Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    let query = { merchantId: req.user._id };
    
    if (req.user.role === 'admin') {
      const merchants = await User.find({ 
        $or: [
          { adminId: req.user.id },
          { adminId: null }
        ]
      });
      const merchantIds = merchants.map(m => m._id);
      // Also include orders for the admin themselves if they have any
      query = { merchantId: { $in: [...merchantIds, req.user._id] } };
    }

    const orders = await Order.find(query).sort("-createdAt");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
