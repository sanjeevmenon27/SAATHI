import express from "express";
import {
  createBooking,
  getOpenRequests,
  getMyBookings,
  getPayments,
  matchSaathis,
  rateBooking,
  submitVisitReport,
  triggerSos,
  updateBookingStatus
} from "../controllers/bookingController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.post("/match", authorize("elder_family"), matchSaathis);
router.post("/", authorize("elder_family"), createBooking);
router.get("/my", getMyBookings);
router.get("/open-requests", authorize("saathi", "admin"), getOpenRequests);
router.get("/payments", authorize("elder_family"), getPayments);
router.post("/sos", authorize("elder_family"), triggerSos);
router.patch("/:id/status", authorize("saathi", "admin"), updateBookingStatus);
router.post("/:id/report", authorize("saathi"), submitVisitReport);
router.post("/:id/rate", authorize("elder_family"), rateBooking);

export default router;
