import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.model.js"; //need to change 
import config from "../config/index.js";

export const isAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: "Please Login",
      });
    }

    const token = authHeader.split(' ')[1];

    const decodedData = jwt.verify(token, config.jwtSecret);
    req.user = await Admin.findById(decodedData.id);

    if (!req.user) {
      return res.status(401).json({ message: "Admin not found, please login again" });
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "token expired" });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "invalid token" });
    }
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};