import { Admin } from '../models/adminModel.js';
import bcrypt from 'bcrypt';
import generateToken from '../utils/generateToken.js';
import TryCatch from '../utils/TryCatch.js';
import * as adminService from '../services/adminService.js';

export const loginAdmin = TryCatch(async (req, res) => {
  adminService.validateLoginCredentials(req.body.email, req.body.password);
  
  const admin = await adminService.authenticateAdmin(req.body.email, req.body.password);

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
  const admin = await adminService.fetchAdminProfile(req.user._id);

  res.status(200).json({
    success: true,
    admin
  });
});