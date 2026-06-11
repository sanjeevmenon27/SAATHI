import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { isDbConnected } from "../db.js";
import { findMockUserById, getMockUserPayload, initializeMockData } from "../mockStore.js";
import { User } from "../models/User.js";

export const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, config.jwtSecret);
    let user;

    if (isDbConnected()) {
      user = await User.findById(decoded.id).select("-password");
    } else {
      await initializeMockData();
      user = await getMockUserPayload(decoded.id);
    }

    if (!user || user.isSuspended) {
      return res.status(401).json({ message: "Account unavailable" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};
