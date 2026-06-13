import { isDbConnected } from "../db.js";
import { Booking } from "../models/Booking.js";
import { Payment } from "../models/Payment.js";
import { SaathiProfile } from "../models/SaathiProfile.js";
import { VisitReport } from "../models/VisitReport.js";
import {
  createMockBooking,
  findMockBookingById,
  getMatchedMockSaathis,
  getMockBookingsForUser,
  getMockPaymentsForElder,
  incrementMockSaathiSessions,
  initializeMockData,
  populateMockBooking,
  rateMockBooking,
  updateMockBooking,
  upsertMockVisitReport
} from "../mockStore.js";
import { calculateAmount } from "../utils.js";

const bookingPopulate = [
  { path: "elderId", select: "name phone address profilePhoto" },
  { path: "saathiId", select: "name phone address profilePhoto" }
];

export const matchSaathis = async (req, res) => {
  const { serviceType } = req.body;

  if (!isDbConnected()) {
    await initializeMockData();
    return res.json(await getMatchedMockSaathis(serviceType));
  }

  const profiles = await SaathiProfile.find({
    backgroundCheckStatus: "approved"
  })
    .populate("userId", "name address profilePhoto")
    .sort({ isAvailable: -1, rating: -1 });

  const matched = profiles
    .filter((profile) => !serviceType || profile.skills.includes(serviceType))
    .map((profile) => ({
      _id: profile.userId._id,
      name: profile.userId.name,
      address: profile.userId.address,
      profilePhoto: profile.userId.profilePhoto,
      bio: profile.bio,
      skills: profile.skills,
      languagesSpoken: profile.languagesSpoken,
      rating: profile.rating,
      totalSessions: profile.totalSessions,
      isAvailable: profile.isAvailable,
      backgroundCheckStatus: profile.backgroundCheckStatus
    }));

  res.json(matched);
};

export const createBooking = async (req, res) => {
  // SC-08: quotedPrice is intentionally excluded — server always derives price
  const { saathiId, serviceType, date, time, duration, notes, location } = req.body;

  // SC-08: Server-side price calculation — never trust client-supplied amount
  const serverAmount = calculateAmount(duration);

  if (!isDbConnected()) {
    await initializeMockData();
    const booking = await createMockBooking({
      elderId: req.user._id,
      saathiId,
      serviceType,
      date,
      time,
      duration,
      notes,
      location,
      quotedPrice: serverAmount // SC-08: Always server-derived
    });
    return res.status(201).json(await populateMockBooking(booking));
  }

  const booking = await Booking.create({
    elderId: req.user._id,
    saathiId,
    serviceType,
    date,
    time,
    duration,
    notes,
    location,
    liveStatus: saathiId ? "Saathi assigned" : "Searching for a Saathi",
    quotedPrice: serverAmount // SC-08: Always server-derived
  });

  await Payment.create({
    bookingId: booking._id,
    amount: serverAmount, // SC-08: Server-derived price
    status: "pending",    // SC-08: Not auto-"paid" — awaiting real payment confirmation
    method: "Pending"
  });

  const populated = await Booking.findById(booking._id).populate(bookingPopulate);
  res.status(201).json(populated);
};

export const getMyBookings = async (req, res) => {
  if (!isDbConnected()) {
    await initializeMockData();
    return res.json(await getMockBookingsForUser(req.user));
  }

  const filter =
    req.user.role === "saathi" ? { saathiId: req.user._id } : { elderId: req.user._id };

  const bookings = await Booking.find(filter).populate(bookingPopulate).sort({ createdAt: -1 });
  const bookingIds = bookings.map((booking) => booking._id);
  const reports = await VisitReport.find({ bookingId: { $in: bookingIds } });
  const payments = await Payment.find({ bookingId: { $in: bookingIds } });

  const payload = bookings.map((booking) => ({
    ...booking.toObject(),
    visitReport: reports.find((report) => report.bookingId.toString() === booking._id.toString()) || null,
    payment: payments.find((payment) => payment.bookingId.toString() === booking._id.toString()) || null
  }));

  res.json(payload);
};

export const updateBookingStatus = async (req, res) => {
  const { status, liveStatus, quotedPrice, assignToSelf } = req.body;

  // SC-08: Validate quotedPrice if a saathi is providing it
  if (quotedPrice !== undefined) {
    const price = Number(quotedPrice);
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ message: "Quoted price must be a positive number." });
    }
  }

  if (!isDbConnected()) {
    await initializeMockData();

    const booking = await findMockBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // SC-04: Ownership check for saathis
    if (req.user.role === "saathi") {
      const isClaiming = assignToSelf && !booking.saathiId;
      const isAssigned = booking.saathiId === req.user._id;
      if (!isClaiming && !isAssigned) {
        return res.status(403).json({ message: "Forbidden" });
      }
    }

    const updated = await updateMockBooking(req.params.id, {
      status,
      liveStatus,
      quotedPrice,
      saathiId: assignToSelf ? req.user._id : undefined
    });
    return res.json(await populateMockBooking(updated));
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  // SC-04: Ownership check for saathis — admin can manage any booking
  if (req.user.role === "saathi") {
    const isClaiming = assignToSelf && !booking.saathiId;
    const isAssigned = booking.saathiId?.toString() === req.user._id.toString();
    if (!isClaiming && !isAssigned) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  if (status) {
    booking.status = status;
  }

  if (liveStatus) {
    booking.liveStatus = liveStatus;
  }

  if (quotedPrice !== undefined) {
    booking.quotedPrice = Number(quotedPrice);
  }

  if (assignToSelf) {
    booking.saathiId = req.user._id;
  }

  await booking.save();
  if (quotedPrice !== undefined) {
    await Payment.findOneAndUpdate(
      { bookingId: booking._id },
      {
        amount: Number(quotedPrice),
        status: "pending",
        method: "Awaiting family approval"
      },
      { upsert: true, new: true }
    );
  }
  const populated = await Booking.findById(booking._id).populate(bookingPopulate);
  res.json(populated);
};

export const getOpenRequests = async (req, res) => {
  // SC-09: Only saathis with approved background checks can see elder PII
  if (req.user.role === "saathi") {
    if (!isDbConnected()) {
      await initializeMockData();
      const { getMockSaathiProfile } = await import("../mockStore.js");
      const profile = await getMockSaathiProfile(req.user._id);
      if (!profile || profile.backgroundCheckStatus !== "approved") {
        return res.status(403).json({ message: "Background check not yet approved." });
      }
    } else {
      const profile = await SaathiProfile.findOne({ userId: req.user._id });
      if (!profile || profile.backgroundCheckStatus !== "approved") {
        return res.status(403).json({ message: "Background check not yet approved." });
      }
    }
  }

  if (!isDbConnected()) {
    await initializeMockData();
    return res.json(await getMatchedMockSaathis("__open_requests__", req.user));
  }

  const bookings = await Booking.find({
    status: "pending",
    $or: [{ saathiId: null }, { saathiId: { $exists: false } }]
  })
    // SC-09: Removed "phone" from projection to avoid PII leakage to saathis
    .populate({ path: "elderId", select: "name address profilePhoto" })
    .sort({ createdAt: -1 })
    .limit(5);

  res.json(bookings);
};

export const submitVisitReport = async (req, res) => {
  const { tasksCompleted, elderMood, concerns } = req.body;

  if (!isDbConnected()) {
    await initializeMockData();

    const booking = await findMockBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // SC-17: Only the assigned saathi can submit a visit report
    if (booking.saathiId !== req.user._id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updated = await updateMockBooking(req.params.id, {
      status: "completed",
      liveStatus: "Visit completed"
    });

    const report = await upsertMockVisitReport(updated._id, {
      tasksCompleted,
      elderMood,
      concerns
    });
    await incrementMockSaathiSessions(booking.saathiId);
    return res.json(report);
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  // SC-17: Only the saathi assigned to this booking may submit a report
  if (booking.saathiId?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Forbidden" });
  }

  booking.status = "completed";
  booking.liveStatus = "Visit completed";
  await booking.save();

  const report = await VisitReport.findOneAndUpdate(
    { bookingId: booking._id },
    { tasksCompleted, elderMood, concerns, submittedAt: new Date() },
    { upsert: true, new: true }
  );

  await SaathiProfile.findOneAndUpdate(
    { userId: booking.saathiId },
    { $inc: { totalSessions: 1 } }
  );

  res.json(report);
};

export const rateBooking = async (req, res) => {
  const { rating } = req.body;

  // SC-16: Validate rating is an integer 1–5
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be a whole number between 1 and 5." });
  }

  if (!isDbConnected()) {
    await initializeMockData();

    const booking = await findMockBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // SC-16: Only the booking's elder can rate it
    if (booking.elderId !== req.user._id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // SC-16: Can only rate completed bookings
    if (booking.status !== "completed") {
      return res.status(400).json({ message: "Can only rate completed bookings." });
    }

    // SC-16: Prevent re-rating
    if (booking.rating != null) {
      return res.status(400).json({ message: "This booking has already been rated." });
    }

    const updated = await rateMockBooking(req.params.id, rating);
    if (!updated) {
      return res.status(404).json({ message: "Booking not found" });
    }
    return res.json({ message: "Rating submitted" });
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  // SC-16: Only the booking's elder may rate
  if (booking.elderId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // SC-16: Can only rate completed bookings
  if (booking.status !== "completed") {
    return res.status(400).json({ message: "Can only rate completed bookings." });
  }

  // SC-16: Prevent re-rating
  if (booking.rating != null) {
    return res.status(400).json({ message: "This booking has already been rated." });
  }

  booking.rating = rating;
  await booking.save();

  const saathiBookings = await Booking.find({
    saathiId: booking.saathiId,
    rating: { $exists: true, $ne: null }
  });
  const avg =
    saathiBookings.reduce((sum, item) => sum + item.rating, 0) / Math.max(saathiBookings.length, 1);

  await SaathiProfile.findOneAndUpdate(
    { userId: booking.saathiId },
    { rating: Number(avg.toFixed(1)) }
  );

  res.json({ message: "Rating submitted" });
};

export const getPayments = async (req, res) => {
  if (!isDbConnected()) {
    await initializeMockData();
    return res.json(await getMockPaymentsForElder(req.user._id));
  }

  const bookings = await Booking.find({ elderId: req.user._id }).select("_id");
  const payments = await Payment.find({ bookingId: { $in: bookings.map((b) => b._id) } })
    .populate({
      path: "bookingId",
      select: "serviceType date status duration"
    })
    .sort({ createdAt: -1 });
  res.json(payments);
};

export const triggerSos = async (req, res) => {
  const { location } = req.body;
  // SC-15: Avoid logging PII to console; use structured logging in production
  console.log(`SOS alert triggered — location received`);
  res.json({ message: "SOS alert shared with support team", location });
};
