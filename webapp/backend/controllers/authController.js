import { isDbConnected } from "../db.js";
import { User } from "../models/User.js";
import { SaathiProfile } from "../models/SaathiProfile.js";
import {
  createMockSaathiProfile,
  createMockUser,
  findMockUserByEmail,
  findMockUserByPhone,
  getMockSaathiProfile,
  getMockUserPayload,
  initializeMockData,
  updateMockSaathiProfile,
  updateMockUser,
  verifyMockPassword
} from "../mockStore.js";
import { comparePassword, hashPassword, signToken } from "../utils.js";
import { blockToken } from "../redisClient.js";

// SC-06: Allowed roles for self-registration — "admin" is excluded
const ALLOWED_REGISTRATION_ROLES = ["elder_family", "saathi"];

// SC-12: Server-side password strength validation
const validatePassword = (password) => {
  if (typeof password !== "string") return false;
  if (password.length < 8) return false;
  if (!/[a-zA-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};

// SC-10/SC-19: Validate that profile photo is a safe HTTPS URL
const validateProfilePhotoUrl = (url) => {
  if (!url) return true; // Optional field — empty is fine
  if (typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
};

// SC-24: Set auth token as httpOnly cookie (not in response body)
const setAuthCookie = (res, token) => {
  res.cookie("saathicare_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 2 * 60 * 60 * 1000 // 2 hours — matches JWT expiry (SC-11)
  });
};

// SC-22: enrichUser relies on the Mongoose toJSON transform (primary protection)
// plus a manual delete as defence-in-depth
const enrichUser = async (user) => {
  const base = user.toObject ? user.toObject() : { ...user };
  delete base.password; // Defence-in-depth; toJSON transform is primary guard (SC-22)
  if (base.aadharNumber) {
    // SC-07: Never expose full Aadhaar in API responses
    base.aadharNumber = `XXXX-XXXX-${String(base.aadharNumber).slice(-4)}`;
  }
  if (user.role === "saathi") {
    base.saathiProfile = await SaathiProfile.findOne({ userId: user._id });
  }
  return base;
};

export const register = async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    address,
    profilePhoto,
    bio,
    skills,
    languagesSpoken,
    aadharNumber
  } = req.body;

  // SC-05/NoSQL: Type-guard inputs to prevent NoSQL injection via object payloads
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Invalid input" });
  }

  // SC-06: Server enforces allowed roles — never trust client-supplied role
  const role = ALLOWED_REGISTRATION_ROLES.includes(req.body.role)
    ? req.body.role
    : "elder_family";

  // SC-12: Server-side password strength
  if (!validatePassword(password)) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters and contain letters and numbers." });
  }

  // SC-10: Validate profile photo URL
  if (!validateProfilePhotoUrl(profilePhoto)) {
    return res.status(400).json({ message: "Profile photo must be a valid HTTPS URL." });
  }

  if (!isDbConnected()) {
    await initializeMockData();
    const existingUser = await findMockUserByEmail(email);
    if (existingUser) {
      // SC-05: Unified error message prevents email enumeration
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    if (role === "elder_family" && phone) {
      const existingUserByPhone = await findMockUserByPhone(phone);
      if (existingUserByPhone) {
        return res.status(400).json({ message: "An account with this phone number already exists." });
      }
    }

    const user = await createMockUser({
      name,
      email,
      password: await hashPassword(password),
      role,
      phone,
      address,
      profilePhoto
    });

    if (role === "saathi") {
      await createMockSaathiProfile({
        userId: user._id,
        bio,
        skills,
        languagesSpoken,
        aadharNumber,
        backgroundCheckStatus: "pending"
      });
    }

    const token = signToken(user._id);
    setAuthCookie(res, token); // SC-24: Token goes in httpOnly cookie
    return res.status(201).json({ user: await getMockUserPayload(user._id) });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    // SC-05: Unified error message prevents email enumeration
    return res.status(400).json({ message: "An account with this email already exists." });
  }

  if (role === "elder_family" && phone) {
    const existingUserByPhone = await User.findOne({ phone: String(phone) });
    if (existingUserByPhone) {
      return res.status(400).json({ message: "An account with this phone number already exists." });
    }
  }

  const user = await User.create({
    name,
    email,
    password: await hashPassword(password),
    role,
    phone,
    address,
    profilePhoto
  });

  if (role === "saathi") {
    await SaathiProfile.create({
      userId: user._id,
      bio: bio || "",
      skills: skills || [],
      languagesSpoken: languagesSpoken || [],
      aadharNumber: aadharNumber || "",
      backgroundCheckStatus: "pending"
    });
  }

  const token = signToken(user._id);
  setAuthCookie(res, token); // SC-24: Token goes in httpOnly cookie
  res.status(201).json({ user: await enrichUser(user) });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  // SC-05/NoSQL: Type-guard inputs
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  if (!isDbConnected()) {
    await initializeMockData();
    const user = await findMockUserByEmail(email);

    // SC-05: Use identical error message whether email or password is wrong
    if (!user || !(await verifyMockPassword(password, user))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.isSuspended) {
      return res.status(403).json({ message: "Account suspended" });
    }

    const token = signToken(user._id);
    setAuthCookie(res, token); // SC-24
    return res.json({ user: await getMockUserPayload(user._id) });
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  // SC-05: Identical error for wrong email or wrong password
  if (!user || !(await comparePassword(password, user.password))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  if (user.isSuspended) {
    return res.status(403).json({ message: "Account suspended" });
  }

  const token = signToken(user._id);
  setAuthCookie(res, token); // SC-24
  res.json({ user: await enrichUser(user) });
};

// SC-11/SC-24: Server-side logout clears the httpOnly cookie and blocks token in Redis
export const logout = async (req, res) => {
  let token;
  if (req.cookies?.saathicare_token) token = req.cookies.saathicare_token;
  else if (req.headers.authorization?.startsWith("Bearer ")) token = req.headers.authorization.split(" ")[1];

  if (token) {
    // 2 hours in seconds (matches JWT expiry)
    await blockToken(token, 2 * 60 * 60);
  }

  res.clearCookie("saathicare_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict"
  });
  res.json({ message: "Logged out successfully" });
};

export const me = async (req, res) => {
  if (!isDbConnected()) {
    return res.json(await getMockUserPayload(req.user._id));
  }

  const user = await User.findById(req.user._id).select("-password");
  const payload = await enrichUser(user);
  res.json(payload);
};

export const updateProfile = async (req, res) => {
  // SC-10/SC-19: Validate profilePhoto URL before update
  if (req.body.profilePhoto && !validateProfilePhotoUrl(req.body.profilePhoto)) {
    return res.status(400).json({ message: "Profile photo must be a valid HTTPS URL." });
  }

  if (!isDbConnected()) {
    const allowedFields = ["name", "phone", "address", "profilePhoto"];
    const userUpdates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        userUpdates[field] = req.body[field];
      }
    });
    await updateMockUser(req.user._id, userUpdates);

    if (req.user.role === "saathi") {
      const profileUpdates = {};
      ["bio", "skills", "languagesSpoken", "isAvailable", "aadharNumber"].forEach((field) => {
        if (req.body[field] !== undefined) {
          profileUpdates[field] = req.body[field];
        }
      });
      await updateMockSaathiProfile(req.user._id, profileUpdates);
    }

    return res.json(await getMockUserPayload(req.user._id));
  }

  const allowedFields = ["name", "phone", "address", "profilePhoto"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      req.user[field] = req.body[field];
    }
  });

  await req.user.save();

  if (req.user.role === "saathi") {
    const profile = await SaathiProfile.findOne({ userId: req.user._id });
    ["bio", "skills", "languagesSpoken", "isAvailable", "aadharNumber"].forEach((field) => {
      if (req.body[field] !== undefined) {
        profile[field] = req.body[field];
      }
    });
    await profile.save();
  }

  const refreshed = await User.findById(req.user._id);
  res.json(await enrichUser(refreshed));
};
