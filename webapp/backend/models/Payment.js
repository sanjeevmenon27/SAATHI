import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["paid", "pending", "failed", "refunded"], default: "pending" },
    method: { type: String, default: "Mock Card" }
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);
