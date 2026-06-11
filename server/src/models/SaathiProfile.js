import mongoose from "mongoose";

const saathiProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    aadharNumber: { type: String, default: "" },
    bio: { type: String, default: "" },
    skills: [{ type: String }],
    languagesSpoken: [{ type: String }],
    backgroundCheckStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    rating: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const SaathiProfile = mongoose.model("SaathiProfile", saathiProfileSchema);
