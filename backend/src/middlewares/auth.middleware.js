import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.model.js"; //need to change 
import config from "../config/index.js";

export const isAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(403).json({
        message: "Please Login",
      });
    }

    const token = authHeader.split(' ')[1];

    const decodedData = jwt.verify(token, config.jwtSecret);

    if (!decodedData)
      return res.status(403).json({
        message: "token expired",
      });

    req.user = await Admin.findById(decodedData.id);

    next();
  } catch (error) {
    res.status(500).json({
      message: "Please Login",
    });
  }
};