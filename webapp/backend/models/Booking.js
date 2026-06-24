import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    elderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    saathiId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    serviceType: {
      type: String,
      enum: ["Hospital Escort", "Companionship", "Tech Help", "Errands", "Daily Check-in Call"],
      required: true
    },
    date: { type: String, required: true },
    time: { type: String, required: true },
    duration: { type: String, enum: ["1hr", "2hr", "half day"], required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "in_progress", "completed", "cancelled", "declined"],
      default: "pending"
    },
    notes: { type: String, default: "" },
    location: { type: String, required: true },
    liveStatus: { type: String, default: "Awaiting assignment" },
    rating: { type: Number, min: 1, max: 5 },
    quotedPrice: { type: Number }
  },
  { timestamps: true }
);

export const Booking = mongoose.model("Booking", bookingSchema);
