import mongoose from 'mongoose';
import GatewayConfig from './models/GatewayConfig.model.js';
import User from './models/User.model.js';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const admin = await User.findOne({ role: "admin" });
        if (!admin) {
            console.log("Admin not found");
            return;
        }
        console.log("Admin ID:", admin._id);

        const config = await GatewayConfig.findOne({ merchantId: admin._id });
        if (!config) {
            console.log("Admin config not found");
        } else {
            console.log("Admin Active Gateway:", config.activeGateway);
            console.log("Config Details:", JSON.stringify(config, null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
