import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: {
      type: String,
      required: true,
      minlength: 8  // SC-12: Enforce minimum password length at schema level
    },
    role: {
      type: String,
      enum: ["elder_family", "saathi", "admin"],
      required: true
    },
    phone: { type: String, default: "", maxlength: 15 },
    address: { type: String, default: "", maxlength: 300 },
    profilePhoto: { type: String, default: "", maxlength: 500 },
    isSuspended: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// SC-22: Schema-level toJSON transform ensures password hash is NEVER
// included in any serialized response, regardless of call path.
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  }
});

export const User = mongoose.model("User", userSchema);
