import mongoose from 'mongoose';
import User from './models/User.model.js';
import dotenv from 'dotenv';

dotenv.config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const firstAdmin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 });
    if (!firstAdmin) {
      console.log('No admin found');
      process.exit();
    }

    console.log(`Primary admin: ${firstAdmin.username} (${firstAdmin._id})`);

    const result = await User.updateMany(
      { role: 'user', adminId: null },
      { $set: { adminId: firstAdmin._id } }
    );

    console.log(`Successfully assigned ${result.modifiedCount} merchants to ${firstAdmin.username}`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

migrate();
