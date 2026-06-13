import { connectDb } from "./db.js";
import { Booking } from "./models/Booking.js";
import { Payment } from "./models/Payment.js";
import { SaathiProfile } from "./models/SaathiProfile.js";
import { User } from "./models/User.js";
import { VisitReport } from "./models/VisitReport.js";
import { calculateAmount, hashPassword } from "./utils.js";

const elderUsers = [
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
];

const saathis = [
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
];

const bookingSeeds = [
  ["meenakshi@example.com", "kalaivani@example.com", "Hospital Escort", "2026-05-18", "09:00", "2hr", "confirmed", "Cardiology review and wheelchair help", "Apollo Hospital, Chennai", "Saathi assigned"],
  ["meenakshi@example.com", "suresh@example.com", "Daily Check-in Call", "2026-05-20", "19:00", "1hr", "pending", "Call daughter after check-in", "Phone support - Mylapore", "Waiting for Saathi confirmation"],
  ["arvind@example.com", "muthu@example.com", "Companionship", "2026-05-10", "16:00", "half day", "completed", "Evening walk and medication reminders", "RS Puram, Coimbatore", "Visit completed"],
  ["priya@example.com", "farzana@example.com", "Tech Help", "2026-05-12", "11:30", "1hr", "completed", "Set up WhatsApp video calling", "KK Nagar, Madurai", "Visit completed"],
  ["arvind@example.com", "suresh@example.com", "Errands", "2026-05-22", "10:00", "2hr", "confirmed", "Pharmacy pickup and grocery stop", "Saibaba Colony, Coimbatore", "Visit route planned"],
  ["meenakshi@example.com", null, "Hospital Escort", "2026-05-25", "08:00", "2hr", "pending", "Needs wheelchair support and calm conversation at the lab.", "Mylapore, Chennai", "Waiting for a Saathi"],
  ["arvind@example.com", null, "Errands", "2026-05-26", "10:30", "1hr", "pending", "Medicine pickup, milk, and help checking the receipt.", "RS Puram, Coimbatore", "Waiting for a Saathi"],
  ["priya@example.com", null, "Tech Help", "2026-05-27", "16:00", "1hr", "pending", "Needs help with WhatsApp video call and recharge app.", "Madurai, Tamil Nadu", "Waiting for a Saathi"],
  ["ranganayaki@example.com", null, "Companionship", "2026-05-28", "17:00", "2hr", "pending", "Prefers Tamil conversation, evening walk, and tea-time company.", "Adyar, Chennai", "Waiting for a Saathi"],
  ["subramanian@example.com", null, "Daily Check-in Call", "2026-05-29", "19:30", "1hr", "pending", "Needs a daily reminder call for dinner and medicines.", "Thanjavur, Tamil Nadu", "Waiting for a Saathi"],
  ["priya@example.com", "kalaivani@example.com", "Hospital Escort", "2026-05-08", "08:30", "half day", "cancelled", "Follow-up visit cancelled by family", "Meenakshi Mission Hospital, Madurai", "Cancelled"],
  ["meenakshi@example.com", "muthu@example.com", "Companionship", "2026-05-24", "15:00", "2hr", "declined", "Tamil-only conversation preferred", "Mylapore, Chennai", "Saathi unavailable"],
  ["priya@example.com", "suresh@example.com", "Daily Check-in Call", "2026-05-14", "20:00", "1hr", "in_progress", "Check dinner and blood sugar log", "Madurai phone check-in", "Call in progress"]
];

const reportSeeds = [
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
];

const seed = async () => {
  const connected = await connectDb();
  if (!connected) {
    console.log("MongoDB not available. Dev mode will use built-in mock data, so explicit seeding is skipped.");
    process.exit(0);
  }
  await Promise.all([
    User.deleteMany({}),
    SaathiProfile.deleteMany({}),
    Booking.deleteMany({}),
    VisitReport.deleteMany({}),
    Payment.deleteMany({})
  ]);

  const passwordMap = new Map();
  for (const person of [...elderUsers, ...saathis.map((entry) => entry.user)]) {
    passwordMap.set(person.email, await hashPassword(person.password));
  }

  const admin = await User.create({
    name: "SaathiCare Admin",
    email: "admin@saathicare.com",
    password: await hashPassword("password123"),
    role: "admin",
    phone: "9000066666",
    address: "Chennai HQ",
    profilePhoto: "https://placehold.co/120x120?text=AD"
  });

  const elders = await User.insertMany(
    elderUsers.map((user) => ({ ...user, password: passwordMap.get(user.email) }))
  );

  const createdSaathiUsers = [];
  for (const saathi of saathis) {
    const createdUser = await User.create({
      ...saathi.user,
      password: passwordMap.get(saathi.user.email)
    });
    createdSaathiUsers.push(createdUser);
    await SaathiProfile.create({
      userId: createdUser._id,
      ...saathi.profile
    });
  }

  const userLookup = new Map([...elders, ...createdSaathiUsers, admin].map((user) => [user.email, user]));
  const createdBookings = [];

  for (const seedItem of bookingSeeds) {
    const [elderEmail, saathiEmail, serviceType, date, time, duration, status, notes, location, liveStatus] = seedItem;
    const booking = await Booking.create({
      elderId: userLookup.get(elderEmail)._id,
      saathiId: saathiEmail ? userLookup.get(saathiEmail)._id : undefined,
      serviceType,
      date,
      time,
      duration,
      status,
      notes,
      location,
      liveStatus,
      rating: status === "completed" ? 5 : undefined
    });
    createdBookings.push(booking);
    if (saathiEmail) {
      await Payment.create({
        bookingId: booking._id,
        amount: calculateAmount(duration),
        status: status === "cancelled" ? "refunded" : "paid",
        method: "Mock UPI"
      });
    }
  }

  for (let index = 0; index < reportSeeds.length; index += 1) {
    const completedBooking = createdBookings.filter((booking) => booking.status === "completed")[index];
    if (!completedBooking) {
      continue;
    }

    await VisitReport.create({
      bookingId: completedBooking._id,
      ...reportSeeds[index]
    });
  }

  console.log("Seed completed");
  process.exit(0);
};

seed().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});
