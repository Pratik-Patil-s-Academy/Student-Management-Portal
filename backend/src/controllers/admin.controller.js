import { Admin } from '../models/admin.model.js';
import bcrypt from 'bcrypt';
import generateToken from '../utils/generateToken.js';
import asyncHandler from '../utils/asyncHandler.js';
import * as adminService from '../services/admin.service.js';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export const loginAdmin = asyncHandler(async (req, res) => {
  adminService.validateLoginCredentials(req.body.email, req.body.password);

  const admin = await adminService.authenticateAdmin(req.body.email, req.body.password);

  const { accessToken, refreshToken } = generateToken(admin);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
  });

  res.status(200).json({
    success: true,
    token: accessToken,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email
    }
  });
});

export const logOutUser = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token not found, please login again" });
  }

  try {
    const decodedValue = jwt.verify(refreshToken, config.refreshTokenSecret);
    const admin = await Admin.findById(decodedValue.id);

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateToken(admin);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    });

    res.status(200).json({
      success: true,
      token: accessToken,
    });
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
});

export const getAdminProfile = asyncHandler(async (req, res) => {
  const admin = await adminService.fetchAdminProfile(req.user._id);

  res.status(200).json({
    success: true,
    admin
  });
});