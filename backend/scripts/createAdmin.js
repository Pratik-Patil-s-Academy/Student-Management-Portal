import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import {Admin} from '../models/adminModel.js';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

export const createAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ email: "admin@gmail.com" });
    if (existingAdmin) {
      logger.info("Admin already exists");
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await Admin.create({
      name: "Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
    });

    logger.info("Admin created successfully", { adminId: admin._id });
    console.log("Admin created successfully");

  } catch (error) {
    logger.error("Error creating admin", { error: error.message, stack: error.stack });
    console.error("Error creating admin:", error);
  }
};
