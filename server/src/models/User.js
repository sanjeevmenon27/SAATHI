import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["elder_family", "saathi", "admin"],
      required: true
    },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    profilePhoto: { type: String, default: "" },
    isSuspended: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
