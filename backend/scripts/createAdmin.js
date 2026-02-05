import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import {Admin} from '../models/adminModel.js';
import dotenv from 'dotenv';

dotenv.config();

export const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    const adminData = {
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123'
    };

    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Admin already exists');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    const admin = await Admin.create({
      name: adminData.name,
      email: adminData.email,
      password: hashedPassword
    });

    console.log('Admin created successfully:', {
      name: admin.name,
      email: admin.email
    });

  } catch (error) {
    console.error('Error creating admin:', error);
  }
};
