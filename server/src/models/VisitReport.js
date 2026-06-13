import mongoose from "mongoose";

const visitReportSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
  tasksCompleted: [{ type: String }],
  elderMood: { type: String, default: "" },
  concerns: { type: String, default: "" },
  submittedAt: { type: Date, default: Date.now }
});

export const VisitReport = mongoose.model("VisitReport", visitReportSchema);
