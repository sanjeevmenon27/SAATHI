import jwt from "jsonwebtoken";
import { envConfig } from "../config.js";
import { isDbConnected } from "../db.js";
import { getMockUserPayload, initializeMockData } from "../mockStore.js";
import { User } from "../models/User.js";
import { isTokenBlocked } from "../redisClient.js";

export const protect = async (req, res, next) => {
  let token;

  // SC-24: Prefer httpOnly cookie; fall back to Authorization header for compatibility
  if (req.cookies?.saathicare_token) {
    token = req.cookies.saathicare_token;
  } else {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      token = header.split(" ")[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  // SC-11: Full revocation check using Redis blocklist
  if (await isTokenBlocked(token)) {
    return res.status(401).json({ message: "Token has been revoked" });
  }

  try {
    const decoded = jwt.verify(token, envConfig.jwtSecret);
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
