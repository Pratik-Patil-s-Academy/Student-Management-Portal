import { Admin } from '../models/adminModel.js';
import bcrypt from 'bcrypt';
import generateToken from '../utils/generateToken.js';
import TryCatch from '../utils/TryCatch.js';

export const loginAdmin = TryCatch(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (!email.includes('@')) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isPasswordMatch = await bcrypt.compare(password, admin.password);
  if (!isPasswordMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  generateToken(admin, res);

  res.status(200).json({
    success: true,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email
    }
  });
});

export const logOutUser = TryCatch(async (req, res) => {
  res.clearCookie("token", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  console.log(process.env.NODE_ENV);
  res.json({
    message: "Logged out successfully",
  });
});

export const getAdminProfile = TryCatch(async (req, res) => {
  const admin = await Admin.findById(req.user._id).select('-password');
  if (!admin) {
    return res.status(404).json({ message: 'Admin not found' });
  }

  res.status(200).json({
    success: true,
    admin
  });
});