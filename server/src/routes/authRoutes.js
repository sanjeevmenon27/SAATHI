import express from "express";
import rateLimit from "express-rate-limit";
import { login, logout, me, register, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// SC-05: Rate limit auth endpoints — max 20 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", protect, me);
router.put("/profile", protect, updateProfile);
// SC-11/SC-24: Explicit server-side logout clears the httpOnly cookie
router.post("/logout", protect, logout);

export default router;
