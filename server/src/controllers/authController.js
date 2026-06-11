import { isDbConnected } from "../db.js";
import { User } from "../models/User.js";
import { SaathiProfile } from "../models/SaathiProfile.js";
import {
  createMockSaathiProfile,
  createMockUser,
  findMockUserByEmail,
  getMockSaathiProfile,
  getMockUserPayload,
  initializeMockData,
  updateMockSaathiProfile,
  updateMockUser,
  verifyMockPassword
} from "../mockStore.js";
import { comparePassword, hashPassword, signToken } from "../utils.js";

const enrichUser = async (user) => {
  const base = user.toObject();
  delete base.password;
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
    role,
    phone,
    address,
    profilePhoto,
    bio,
    skills,
    languagesSpoken,
    aadharNumber
  } = req.body;

  if (!isDbConnected()) {
    await initializeMockData();
    const existingUser = await findMockUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
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

    return res.status(201).json({
      token: signToken(user._id),
      user: await getMockUserPayload(user._id)
    });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already exists" });
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

  res.status(201).json({
    token: signToken(user._id),
    user: await enrichUser(user)
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!isDbConnected()) {
    await initializeMockData();
    const user = await findMockUserByEmail(email);

    if (!user || !(await verifyMockPassword(password, user))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.isSuspended) {
      return res.status(403).json({ message: "Account suspended" });
    }

    return res.json({
      token: signToken(user._id),
      user: await getMockUserPayload(user._id)
    });
  }

  const user = await User.findOne({ email });

  if (!user || !(await comparePassword(password, user.password))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  if (user.isSuspended) {
    return res.status(403).json({ message: "Account suspended" });
  }

  res.json({
    token: signToken(user._id),
    user: await enrichUser(user)
  });
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
