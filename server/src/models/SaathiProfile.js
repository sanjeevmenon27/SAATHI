import mongoose from "mongoose";

const saathiProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    // SC-07: Store raw Aadhaar only; mask it in toJSON transform before any API response
    aadharNumber: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 1000 },
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

// SC-07: Never expose the full Aadhaar number in any API response.
// The stored value is kept intact for admin/verification purposes,
// but the serialized form always shows only the last 4 digits.
saathiProfileSchema.set("toJSON", {
  transform: (_doc, ret) => {
    if (ret.aadharNumber) {
      ret.aadharNumber = `XXXX-XXXX-${String(ret.aadharNumber).slice(-4)}`;
    }
    return ret;
  }
});

export const SaathiProfile = mongoose.model("SaathiProfile", saathiProfileSchema);
