import { isDbConnected } from "../db.js";
import {
  getMockAnalytics,
  getMockBookings,
  getMockUsers,
  initializeMockData,
  updateMockSaathiProfile,
  updateMockUser
} from "../mockStore.js";
import { Booking } from "../models/Booking.js";
import { Payment } from "../models/Payment.js";
import { SaathiProfile } from "../models/SaathiProfile.js";
import { User } from "../models/User.js";

export const getUsers = async (_req, res) => {
  if (!isDbConnected()) {
    await initializeMockData();
    return res.json(await getMockUsers());
  }

  const users = await User.find().select("-password").sort({ createdAt: -1 });
  const profiles = await SaathiProfile.find();

  const payload = users.map((user) => ({
    ...user.toObject(),
    saathiProfile: profiles.find((profile) => profile.userId.toString() === user._id.toString()) || null
  }));
  res.json(payload);
};

export const updateSaathiApproval = async (req, res) => {
  if (!isDbConnected()) {
    await initializeMockData();
    return res.json(await updateMockSaathiProfile(req.params.userId, { backgroundCheckStatus: req.body.status }));
  }

  const profile = await SaathiProfile.findOneAndUpdate(
    { userId: req.params.userId },
    { backgroundCheckStatus: req.body.status },
    { new: true }
  );
  res.json(profile);
};

export const toggleSuspension = async (req, res) => {
  if (!isDbConnected()) {
    await initializeMockData();
    return res.json(await updateMockUser(req.params.userId, { isSuspended: req.body.isSuspended }));
  }

  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { isSuspended: req.body.isSuspended },
    { new: true }
  ).select("-password");
  res.json(user);
};

export const getBookings = async (_req, res) => {
  if (!isDbConnected()) {
    await initializeMockData();
    return res.json(await getMockBookings());
  }

  const bookings = await Booking.find()
    .populate("elderId", "name")
    .populate("saathiId", "name")
    .sort({ createdAt: -1 });
  res.json(bookings);
};

export const getAnalytics = async (_req, res) => {
  if (!isDbConnected()) {
    await initializeMockData();
    return res.json(await getMockAnalytics());
  }

  const [totalBookings, activeSaathis, payments] = await Promise.all([
    Booking.countDocuments(),
    SaathiProfile.countDocuments({ isAvailable: true, backgroundCheckStatus: "approved" }),
    Payment.find({ status: "paid" })
  ]);

  const revenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  res.json({ totalBookings, activeSaathis, revenue });
};
