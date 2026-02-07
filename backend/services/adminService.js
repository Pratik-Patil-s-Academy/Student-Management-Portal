import { Admin } from '../models/adminModel.js';
import bcrypt from 'bcrypt';

export const validateLoginCredentials = (email, password) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  if (!email.includes('@')) {
    throw new Error('Invalid email format');
  }
};

export const authenticateAdmin = async (email, password) => {
  const admin = await Admin.findOne({ email });
  if (!admin) {
    throw new Error('Invalid credentials');
  }

  const isPasswordMatch = await bcrypt.compare(password, admin.password);
  if (!isPasswordMatch) {
    throw new Error('Invalid credentials');
  }

  return admin;
};

export const fetchAdminProfile = async (adminId) => {
  const admin = await Admin.findById(adminId).select('-password');
  if (!admin) {
    throw new Error('Admin not found');
  }

  return admin;
};
