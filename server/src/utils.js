import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "./config.js";

export const hashPassword = (password) => bcrypt.hash(password, 10);
export const comparePassword = (plain, hashed) => bcrypt.compare(plain, hashed);
export const signToken = (id) => jwt.sign({ id }, config.jwtSecret, { expiresIn: "7d" });

export const calculateAmount = (duration) => {
  switch (duration) {
    case "1hr":
      return 399;
    case "2hr":
      return 699;
    case "half day":
      return 1499;
    default:
      return 499;
  }
};
