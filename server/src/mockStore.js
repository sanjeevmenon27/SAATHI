import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { comparePassword, hashPassword } from "./utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "../data.json");

const state = {
  initialized: false,
  users: [],
  saathiProfiles: [],
  bookings: [],
  visitReports: [],
  payments: []
};

const seedData = {
  elderUsers: [
    {
      name: "Meenakshi Raman",
      email: "meenakshi@example.com",
      password: "password123",
      role: "elder_family",
      phone: "9876543210",
      address: "Mylapore, Chennai",
      profilePhoto: "https://placehold.co/120x120?text=MR"
    },
    {
      name: "Arvind Kumar",
      email: "arvind@example.com",
      password: "password123",
      role: "elder_family",
      phone: "9123456780",
      address: "Coimbatore, Tamil Nadu",
      profilePhoto: "https://placehold.co/120x120?text=AK"
    },
    {
      name: "Priya Natarajan",
      email: "priya@example.com",
      password: "password123",
      role: "elder_family",
      phone: "9345678120",
      address: "Madurai, Tamil Nadu",
      profilePhoto: "https://placehold.co/120x120?text=PN"
    },
    {
      name: "Ranganayaki Ammal",
      email: "ranganayaki@example.com",
      password: "password123",
      role: "elder_family",
      phone: "9440012345",
      address: "Adyar, Chennai",
      profilePhoto: "https://placehold.co/120x120?text=RA"
    },
    {
      name: "Subramanian Iyer",
      email: "subramanian@example.com",
      password: "password123",
      role: "elder_family",
      phone: "9440054321",
      address: "Thanjavur, Tamil Nadu",
      profilePhoto: "https://placehold.co/120x120?text=SI"
    }
  ],
  saathis: [
    {
      user: {
        name: "Kalaivani S",
        email: "kalaivani@example.com",
        password: "password123",
        role: "saathi",
        phone: "9000011111",
        address: "T Nagar, Chennai",
        profilePhoto: "https://placehold.co/120x120?text=KS"
      },
      profile: {
        bio: "Gentle hospital companion with strong wheelchair assistance experience.",
        skills: ["Hospital Escort", "Companionship"],
        languagesSpoken: ["Tamil", "English"],
        backgroundCheckStatus: "approved",
        rating: 4.8,
        totalSessions: 34,
        isAvailable: true,
        aadharNumber: "000000000001" // SC-18: Clearly synthetic — not a real Aadhaar number
      }
    },
    {
      user: {
        name: "Suresh Babu",
        email: "suresh@example.com",
        password: "password123",
        role: "saathi",
        phone: "9000022222",
        address: "Velachery, Chennai",
        profilePhoto: "https://placehold.co/120x120?text=SB"
      },
      profile: {
        bio: "Errands and daily support specialist with calm communication style.",
        skills: ["Errands", "Daily Check-in Call", "Companionship"],
        languagesSpoken: ["Tamil", "Telugu"],
        backgroundCheckStatus: "approved",
        rating: 4.6,
        totalSessions: 22,
        isAvailable: true,
        aadharNumber: "000000000002" // SC-18: Clearly synthetic
      }
    },
    {
      user: {
        name: "Farzana Ali",
        email: "farzana@example.com",
        password: "password123",
        role: "saathi",
        phone: "9000033333",
        address: "Anna Nagar, Chennai",
        profilePhoto: "https://placehold.co/120x120?text=FA"
      },
      profile: {
        bio: "Patient tech helper for video calls, telehealth apps, and smartphones.",
        skills: ["Tech Help", "Daily Check-in Call"],
        languagesSpoken: ["English", "Hindi", "Tamil"],
        backgroundCheckStatus: "approved",
        rating: 4.9,
        totalSessions: 41,
        isAvailable: false,
        aadharNumber: "000000000003" // SC-18: Clearly synthetic
      }
    },
    {
      user: {
        name: "Muthu Raj",
        email: "muthu@example.com",
        password: "password123",
        role: "saathi",
        phone: "9000044444",
        address: "Trichy, Tamil Nadu",
        profilePhoto: "https://placehold.co/120x120?text=MR"
      },
      profile: {
        bio: "Long-form companionship visits with reading, walks, and meal reminders.",
        skills: ["Companionship", "Errands"],
        languagesSpoken: ["Tamil"],
        backgroundCheckStatus: "approved",
        rating: 4.5,
        totalSessions: 18,
        isAvailable: true,
        aadharNumber: "000000000004" // SC-18: Clearly synthetic
      }
    },
    {
      user: {
        name: "Nivetha John",
        email: "nivetha@example.com",
        password: "password123",
        role: "saathi",
        phone: "9000055555",
        address: "Salem, Tamil Nadu",
        profilePhoto: "https://placehold.co/120x120?text=NJ"
      },
      profile: {
        bio: "Pending verification companion focused on elder comfort and calls.",
        skills: ["Daily Check-in Call", "Companionship"],
        languagesSpoken: ["Tamil", "Malayalam"],
        backgroundCheckStatus: "pending",
        rating: 0,
        totalSessions: 0,
        isAvailable: false,
        aadharNumber: "000000000005" // SC-18: Clearly synthetic
      }
    }
  ],
  bookings: [
    ["meenakshi@example.com", "kalaivani@example.com", "Hospital Escort", "2026-05-18", "09:00", "2hr", "confirmed", "Cardiology review and wheelchair help", "Apollo Hospital, Chennai", "Saathi assigned", 5],
    ["meenakshi@example.com", "suresh@example.com", "Daily Check-in Call", "2026-05-20", "19:00", "1hr", "pending", "Call daughter after check-in", "Phone support - Mylapore", "Waiting for Saathi confirmation", null],
    ["arvind@example.com", "muthu@example.com", "Companionship", "2026-05-10", "16:00", "half day", "completed", "Evening walk and medication reminders", "RS Puram, Coimbatore", "Visit completed", 5],
    ["priya@example.com", "farzana@example.com", "Tech Help", "2026-05-12", "11:30", "1hr", "completed", "Set up WhatsApp video calling", "KK Nagar, Madurai", "Visit completed", 5],
    ["arvind@example.com", "suresh@example.com", "Errands", "2026-05-22", "10:00", "2hr", "confirmed", "Pharmacy pickup and grocery stop", "Saibaba Colony, Coimbatore", "Visit route planned", null],
    ["priya@example.com", "kalaivani@example.com", "Hospital Escort", "2026-05-08", "08:30", "half day", "cancelled", "Follow-up visit cancelled by family", "Meenakshi Mission Hospital, Madurai", "Cancelled", null],
    ["meenakshi@example.com", "muthu@example.com", "Companionship", "2026-05-24", "15:00", "2hr", "declined", "Tamil-only conversation preferred", "Mylapore, Chennai", "Saathi unavailable", null],
    ["priya@example.com", "suresh@example.com", "Daily Check-in Call", "2026-05-14", "20:00", "1hr", "in_progress", "Check dinner and blood sugar log", "Madurai phone check-in", "Call in progress", null],
    ["meenakshi@example.com", null, "Hospital Escort", "2026-05-25", "08:00", "2hr", "pending", "Needs wheelchair support and calm conversation at the lab.", "Mylapore, Chennai", "Waiting for a Saathi", null],
    ["arvind@example.com", null, "Errands", "2026-05-26", "10:30", "1hr", "pending", "Medicine pickup, milk, and help checking the receipt.", "RS Puram, Coimbatore", "Waiting for a Saathi", null],
    ["priya@example.com", null, "Tech Help", "2026-05-27", "16:00", "1hr", "pending", "Needs help with WhatsApp video call and recharge app.", "Madurai, Tamil Nadu", "Waiting for a Saathi", null],
    ["ranganayaki@example.com", null, "Companionship", "2026-05-28", "17:00", "2hr", "pending", "Prefers Tamil conversation, evening walk, and tea-time company.", "Adyar, Chennai", "Waiting for a Saathi", null],
    ["subramanian@example.com", null, "Daily Check-in Call", "2026-05-29", "19:30", "1hr", "pending", "Needs a daily reminder call for dinner and medicines.", "Thanjavur, Tamil Nadu", "Waiting for a Saathi", null]
  ],
  reports: [
    {
      serviceType: "Companionship",
      tasksCompleted: ["Walked in the park", "Reviewed medicine box", "Had evening tea together"],
      elderMood: "Relaxed and chatty",
      concerns: "Requested a slightly earlier visit next time."
    },
    {
      serviceType: "Tech Help",
      tasksCompleted: ["Installed WhatsApp", "Saved family contacts", "Tested video call"],
      elderMood: "Happy and confident",
      concerns: "Needs a printed one-page guide."
    },
    {
      serviceType: "Hospital Escort",
      tasksCompleted: ["Wheelchair support", "Registration desk help", "Prescription pickup"],
      elderMood: "Tired but reassured",
      concerns: "Long waiting time at hospital."
    }
  ]
};

const amountForDuration = (duration) => {
  if (duration === "1hr") return 399;
  if (duration === "2hr") return 699;
  if (duration === "half day") return 1499;
  return 499;
};

const sanitizeUser = (user) => {
  // SC-07: Exclude password hash and mask Aadhaar number in all serialized user objects
  const { password, aadharNumber, ...rest } = user;
  if (aadharNumber) {
    rest.aadharNumber = `XXXX-XXXX-${String(aadharNumber).slice(-4)}`;
  }
  return rest;
};

const withSaathiProfile = (user) => {
  const base = sanitizeUser(user);
  if (base.role === "saathi") {
    base.saathiProfile = state.saathiProfiles.find((profile) => profile.userId === base._id) || null;
  }
  return base;
};

const loadData = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(data);
    state.users = parsed.users || [];
    state.saathiProfiles = parsed.saathiProfiles || [];
    state.bookings = parsed.bookings || [];
    state.visitReports = parsed.visitReports || [];
    state.payments = parsed.payments || [];
    state.initialized = true;
    return true;
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Error loading local data file:", error);
    }
    return false;
  }
};

const saveData = async () => {
  try {
    const payload = {
      users: state.users,
      saathiProfiles: state.saathiProfiles,
      bookings: state.bookings,
      visitReports: state.visitReports,
      payments: state.payments
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(payload, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving local data file:", error);
  }
};

export const initializeMockData = async () => {
  if (state.initialized) {
    return;
  }

  const loaded = await loadData();
  if (loaded) {
    return;
  }

  state.users = [];
  state.saathiProfiles = [];
  state.bookings = [];
  state.visitReports = [];
  state.payments = [];

  const addUser = async (user) => {
    const now = new Date().toISOString();
    const record = {
      _id: randomUUID(),
      ...user,
      password: await hashPassword(user.password),
      isSuspended: false,
      createdAt: now,
      updatedAt: now
    };
    state.users.push(record);
    return record;
  };

  const admin = await addUser({
    name: "SaathiCare Admin",
    email: "admin@saathicare.com",
    password: "password123",
    role: "admin",
    phone: "9000066666",
    address: "Chennai HQ",
    profilePhoto: "https://placehold.co/120x120?text=AD"
  });

  const userLookup = new Map([[admin.email, admin]]);

  for (const elder of seedData.elderUsers) {
    const created = await addUser(elder);
    userLookup.set(created.email, created);
  }

  for (const saathi of seedData.saathis) {
    const createdUser = await addUser(saathi.user);
    userLookup.set(createdUser.email, createdUser);
    state.saathiProfiles.push({
      _id: randomUUID(),
      userId: createdUser._id,
      ...saathi.profile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  for (const row of seedData.bookings) {
    const [elderEmail, saathiEmail, serviceType, date, time, duration, status, notes, location, liveStatus, rating] = row;
    const booking = {
      _id: randomUUID(),
      elderId: userLookup.get(elderEmail)._id,
      saathiId: saathiEmail ? userLookup.get(saathiEmail)._id : null,
      serviceType,
      date,
      time,
      duration,
      status,
      notes,
      location,
      liveStatus,
      rating,
      quotedPrice: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    state.bookings.push(booking);
    if (saathiEmail) {
      state.payments.push({
        _id: randomUUID(),
        bookingId: booking._id,
        amount: amountForDuration(duration),
        status: status === "cancelled" ? "refunded" : "paid",
        method: "Mock UPI",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }

  const completedBookings = state.bookings.filter((booking) => booking.status === "completed");
  seedData.reports.forEach((report, index) => {
    if (!completedBookings[index]) return;
    state.visitReports.push({
      _id: randomUUID(),
      bookingId: completedBookings[index]._id,
      tasksCompleted: report.tasksCompleted,
      elderMood: report.elderMood,
      concerns: report.concerns,
      submittedAt: new Date().toISOString()
    });
  });

  state.initialized = true;
  await saveData();
};

export const findMockUserByEmail = async (email) => {
  await initializeMockData();
  return state.users.find((user) => user.email.toLowerCase() === String(email).toLowerCase()) || null;
};

export const findMockUserByPhone = async (phone) => {
  await initializeMockData();
  if (!phone) return null;
  return state.users.find((user) => user.phone === phone) || null;
};

// SC-04/SC-16/SC-17: Needed by controllers for ownership checks before mutations
export const findMockBookingById = async (bookingId) => {
  await initializeMockData();
  return state.bookings.find((item) => item._id === bookingId) || null;
};

export const findMockUserById = async (id) => {
  await initializeMockData();
  return state.users.find((user) => user._id === id) || null;
};

export const createMockUser = async (data) => {
  await initializeMockData();
  const now = new Date().toISOString();
  const user = {
    _id: randomUUID(),
    name: data.name,
    email: data.email.toLowerCase(),
    password: data.password,
    role: data.role,
    phone: data.phone || "",
    address: data.address || "",
    profilePhoto: data.profilePhoto || "",
    isSuspended: false,
    createdAt: now,
    updatedAt: now
  };
  state.users.push(user);
  await saveData();
  return user;
};

export const createMockSaathiProfile = async (data) => {
  await initializeMockData();
  const profile = {
    _id: randomUUID(),
    userId: data.userId,
    bio: data.bio || "",
    skills: data.skills || [],
    languagesSpoken: data.languagesSpoken || [],
    backgroundCheckStatus: data.backgroundCheckStatus || "pending",
    rating: data.rating || 0,
    totalSessions: data.totalSessions || 0,
    isAvailable: data.isAvailable || false,
    aadharNumber: data.aadharNumber || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  state.saathiProfiles.push(profile);
  await saveData();
  return profile;
};

export const getMockSaathiProfile = async (userId) => {
  await initializeMockData();
  // SC-07: Return raw profile for internal checks; masking is done in sanitizeUser/toJSON
  return state.saathiProfiles.find((profile) => profile.userId === userId) || null;
};

export const updateMockUser = async (userId, updates) => {
  await initializeMockData();
  const user = state.users.find((item) => item._id === userId);
  if (!user) return null;
  Object.assign(user, updates, { updatedAt: new Date().toISOString() });
  await saveData();
  return user;
};

export const updateMockSaathiProfile = async (userId, updates) => {
  await initializeMockData();
  const profile = state.saathiProfiles.find((item) => item.userId === userId);
  if (!profile) return null;
  Object.assign(profile, updates, { updatedAt: new Date().toISOString() });
  await saveData();
  return profile;
};

export const getMockUserPayload = async (userId) => {
  await initializeMockData();
  const user = state.users.find((item) => item._id === userId);
  return user ? withSaathiProfile(user) : null;
};

export const verifyMockPassword = async (plainPassword, user) => comparePassword(plainPassword, user.password);

const compactUser = (user) => {
  if (!user) return null;
  return {
    _id: user._id,
    name: user.name,
    phone: user.phone,
    address: user.address,
    profilePhoto: user.profilePhoto
  };
};

export const getMatchedMockSaathis = async (serviceType, user = null) => {
  await initializeMockData();
  if (serviceType === "__open_requests__") {
    return state.bookings
      .filter((booking) => booking.status === "pending" && !booking.saathiId)
      .slice(0, 5)
      .map((booking) => ({
        ...booking,
        elderId: compactUser(state.users.find((item) => item._id === booking.elderId)),
        saathiId: user ? compactUser(state.users.find((item) => item._id === user._id)) : null
      }));
  }

  return state.saathiProfiles
    .filter((profile) => profile.backgroundCheckStatus === "approved")
    .filter((profile) => !serviceType || profile.skills.includes(serviceType))
    .map((profile) => {
      const user = state.users.find((item) => item._id === profile.userId);
      return {
        _id: user._id,
        name: user.name,
        address: user.address,
        profilePhoto: user.profilePhoto,
        bio: profile.bio,
        skills: profile.skills,
        languagesSpoken: profile.languagesSpoken,
        rating: profile.rating,
        totalSessions: profile.totalSessions,
        isAvailable: profile.isAvailable,
        backgroundCheckStatus: profile.backgroundCheckStatus
      };
    })
    .sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable) || b.rating - a.rating);
};

export const createMockBooking = async (data) => {
  await initializeMockData();
  const now = new Date().toISOString();
  const booking = {
    _id: randomUUID(),
    elderId: data.elderId,
    saathiId: data.saathiId || null,
    serviceType: data.serviceType,
    date: data.date,
    time: data.time,
    duration: data.duration,
    status: "pending",
    notes: data.notes || "",
    location: data.location,
    liveStatus: data.saathiId ? "Saathi assigned" : "Searching for a Saathi",
    rating: null,
    quotedPrice: data.quotedPrice || null,
    createdAt: now,
    updatedAt: now
  };
  state.bookings.unshift(booking);
  if (data.saathiId) {
    state.payments.unshift({
      _id: randomUUID(),
      bookingId: booking._id,
      amount: data.quotedPrice || amountForDuration(data.duration),
      status: "paid",
      method: "Mock UPI",
      createdAt: now,
      updatedAt: now
    });
  }
  await saveData();
  return booking;
};

export const populateMockBooking = async (booking) => {
  await initializeMockData();
  return {
    ...booking,
    elderId: compactUser(state.users.find((user) => user._id === booking.elderId)),
    saathiId: compactUser(state.users.find((user) => user._id === booking.saathiId))
  };
};

export const getMockBookingsForUser = async (user) => {
  await initializeMockData();
  const filtered = state.bookings.filter((booking) =>
    user.role === "saathi" ? booking.saathiId === user._id : booking.elderId === user._id
  );

  return Promise.all(
    filtered
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(async (booking) => {
        const populated = await populateMockBooking(booking);
        return {
          ...populated,
          visitReport: state.visitReports.find((report) => report.bookingId === booking._id) || null,
          payment: state.payments.find((payment) => payment.bookingId === booking._id) || null
        };
      })
  );
};

export const updateMockBooking = async (bookingId, updates) => {
  await initializeMockData();
  const booking = state.bookings.find((item) => item._id === bookingId);
  if (!booking) return null;
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      booking[key] = value;
    }
  });
  booking.updatedAt = new Date().toISOString();

  if (updates.quotedPrice !== undefined) {
    let payment = state.payments.find((item) => item.bookingId === bookingId);
    if (!payment) {
      payment = {
        _id: randomUUID(),
        bookingId,
        amount: updates.quotedPrice,
        status: "pending",
        method: "Awaiting family approval",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      state.payments.push(payment);
    } else {
      payment.amount = updates.quotedPrice;
      payment.status = "pending";
      payment.method = "Awaiting family approval";
      payment.updatedAt = new Date().toISOString();
    }
  }
  await saveData();
  return booking;
};

export const upsertMockVisitReport = async (bookingId, data) => {
  await initializeMockData();
  let report = state.visitReports.find((item) => item.bookingId === bookingId);
  if (report) {
    Object.assign(report, data, { submittedAt: new Date().toISOString() });
    await saveData();
    return report;
  }

  report = {
    _id: randomUUID(),
    bookingId,
    tasksCompleted: data.tasksCompleted || [],
    elderMood: data.elderMood || "",
    concerns: data.concerns || "",
    submittedAt: new Date().toISOString()
  };
  state.visitReports.push(report);
  await saveData();
  return report;
};

export const incrementMockSaathiSessions = async (userId) => {
  await initializeMockData();
  const profile = state.saathiProfiles.find((item) => item.userId === userId);
  if (profile) {
    profile.totalSessions += 1;
    profile.updatedAt = new Date().toISOString();
    await saveData();
  }
};

export const rateMockBooking = async (bookingId, rating) => {
  await initializeMockData();
  const booking = state.bookings.find((item) => item._id === bookingId);
  if (!booking) return null;
  booking.rating = rating;
  booking.updatedAt = new Date().toISOString();

  const ratings = state.bookings
    .filter((item) => item.saathiId === booking.saathiId && typeof item.rating === "number")
    .map((item) => item.rating);
  const profile = state.saathiProfiles.find((item) => item.userId === booking.saathiId);
  if (profile && ratings.length) {
    profile.rating = Number((ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(1));
    profile.updatedAt = new Date().toISOString();
  }
  await saveData();
  return booking;
};

export const getMockPaymentsForElder = async (elderId) => {
  await initializeMockData();
  return state.payments
    .filter((payment) => {
      const booking = state.bookings.find((item) => item._id === payment.bookingId);
      return booking?.elderId === elderId;
    })
    .map((payment) => {
      const booking = state.bookings.find((item) => item._id === payment.bookingId);
      return {
        ...payment,
        bookingId: booking
          ? {
              _id: booking._id,
              serviceType: booking.serviceType,
              date: booking.date,
              status: booking.status,
              duration: booking.duration
            }
          : null
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getMockUsers = async () => {
  await initializeMockData();
  return state.users
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((user) => withSaathiProfile(user));
};

export const getMockBookings = async () => {
  await initializeMockData();
  return state.bookings
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((booking) => ({
      ...booking,
      elderId: (() => {
        const user = state.users.find((item) => item._id === booking.elderId);
        return user ? { _id: user._id, name: user.name } : null;
      })(),
      saathiId: (() => {
        const user = state.users.find((item) => item._id === booking.saathiId);
        return user ? { _id: user._id, name: user.name } : null;
      })()
    }));
};

export const getMockAnalytics = async () => {
  await initializeMockData();
  return {
    totalBookings: state.bookings.length,
    activeSaathis: state.saathiProfiles.filter(
      (profile) => profile.isAvailable && profile.backgroundCheckStatus === "approved"
    ).length,
    revenue: state.payments.filter((payment) => payment.status === "paid").reduce((sum, item) => sum + item.amount, 0)
  };
};
