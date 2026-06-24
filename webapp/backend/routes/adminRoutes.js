import express from "express";
import {
  getAnalytics,
  getBookings,
  getUsers,
  toggleSuspension,
  updateSaathiApproval
} from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, authorize("admin"));
router.get("/users", getUsers);
router.get("/bookings", getBookings);
router.get("/analytics", getAnalytics);
router.patch("/saathis/:userId/approval", updateSaathiApproval);
router.patch("/users/:userId/suspension", toggleSuspension);

export default router;
