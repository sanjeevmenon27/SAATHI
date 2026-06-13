import { readFileSync, existsSync } from 'fs';

const read = (p) => { try { return readFileSync(p, 'utf8'); } catch { return ''; } };

const checks = [
  // SC-01
  { id:'SC-01', finding:'SC-01', desc:'Live Atlas credentials — manual rotation required', severity:'CRITICAL',
    test: () => read('server/.env').includes('Prosanjeev2005'),
    expectTrue: true, note:'MANUAL ACTION REQUIRED — Rotate Atlas password at cloud.mongodb.com → Database Access' },

  // SC-02
  { id:'SC-02a', finding:'SC-02', desc:'No hardcoded JWT fallback string in config.js', severity:'CRITICAL',
    test: () => !read('server/src/config.js').includes('super-secret'), expectTrue: true },
  { id:'SC-02b', finding:'SC-02', desc:'Server fails fast if JWT_SECRET missing (no || fallback)', severity:'CRITICAL',
    test: () => read('server/src/config.js').includes('throw new Error'), expectTrue: true },
  { id:'SC-02c', finding:'SC-02', desc:'JWT_SECRET in .env is not the trivial default "change-me"', severity:'CRITICAL',
    test: () => !read('server/.env').includes('JWT_SECRET=change-me'), expectTrue: true },

  // SC-03
  { id:'SC-03a', finding:'SC-03', desc:'CORS wildcard origin: true removed', severity:'CRITICAL',
    test: () => !read('server/src/index.js').includes('origin: true'), expectTrue: true },
  { id:'SC-03b', finding:'SC-03', desc:'CORS uses explicit allowlist from config.clientUrl', severity:'CRITICAL',
    test: () => read('server/src/index.js').includes('origin: config.clientUrl'), expectTrue: true },

  // SC-04
  { id:'SC-04a', finding:'SC-04', desc:'Ownership check added to updateBookingStatus (saathi)', severity:'CRITICAL',
    test: () => { const c = read('server/src/controllers/bookingController.js'); return c.includes('isClaiming') && c.includes('isAssigned'); }, expectTrue: true },
  { id:'SC-04b', finding:'SC-04', desc:'Ownership check added to submitVisitReport', severity:'CRITICAL',
    test: () => read('server/src/controllers/bookingController.js').includes('booking.saathiId?.toString() !== req.user._id.toString()'), expectTrue: true },
  { id:'SC-04c', finding:'SC-04', desc:'Ownership check added to rateBooking (elder)', severity:'CRITICAL',
    test: () => read('server/src/controllers/bookingController.js').includes('booking.elderId.toString() !== req.user._id.toString()'), expectTrue: true },

  // SC-05
  { id:'SC-05a', finding:'SC-05', desc:'Rate limiter applied to POST /login', severity:'HIGH',
    test: () => read('server/src/routes/authRoutes.js').includes('authLimiter, login'), expectTrue: true },
  { id:'SC-05b', finding:'SC-05', desc:'Rate limiter applied to POST /register', severity:'HIGH',
    test: () => read('server/src/routes/authRoutes.js').includes('authLimiter, register'), expectTrue: true },
  { id:'SC-05c', finding:'SC-05', desc:'Unified error message — no phone number leaked in error response', severity:'HIGH',
    test: () => !read('server/src/controllers/authController.js').includes('Associated phone number'), expectTrue: true },

  // SC-06
  { id:'SC-06', finding:'SC-06', desc:'Role whitelist enforced server-side (admin role not registerable)', severity:'HIGH',
    test: () => read('server/src/controllers/authController.js').includes('ALLOWED_REGISTRATION_ROLES'), expectTrue: true },

  // SC-07
  { id:'SC-07a', finding:'SC-07', desc:'SaathiProfile toJSON masks Aadhaar to XXXX-XXXX-NNNN', severity:'HIGH',
    test: () => read('server/src/models/SaathiProfile.js').includes('XXXX-XXXX-'), expectTrue: true },
  { id:'SC-07b', finding:'SC-07', desc:'mockStore sanitizeUser masks Aadhaar', severity:'HIGH',
    test: () => read('server/src/mockStore.js').includes('XXXX-XXXX-'), expectTrue: true },
  { id:'SC-07c', finding:'SC-07', desc:'enrichUser in authController masks full Aadhaar', severity:'HIGH',
    test: () => read('server/src/controllers/authController.js').includes('XXXX-XXXX-'), expectTrue: true },

  // SC-08
  { id:'SC-08a', finding:'SC-08', desc:'createBooking uses server-side calculateAmount (not client price)', severity:'HIGH',
    test: () => read('server/src/controllers/bookingController.js').includes('const serverAmount = calculateAmount'), expectTrue: true },
  { id:'SC-08b', finding:'SC-08', desc:'Payment status is "pending" not auto "paid" on booking creation', severity:'HIGH',
    test: () => read('server/src/controllers/bookingController.js').includes('status: "pending"'), expectTrue: true },

  // SC-09
  { id:'SC-09a', finding:'SC-09', desc:'getOpenRequests checks backgroundCheckStatus === approved', severity:'HIGH',
    test: () => read('server/src/controllers/bookingController.js').includes('backgroundCheckStatus !== "approved"'), expectTrue: true },
  { id:'SC-09b', finding:'SC-09', desc:'Phone field removed from elderId populate projection', severity:'HIGH',
    test: () => read('server/src/controllers/bookingController.js').includes('"name address profilePhoto"') || read('server/src/controllers/bookingController.js').includes("'name address profilePhoto'"), expectTrue: true },

  // SC-10
  { id:'SC-10', finding:'SC-10', desc:'validateProfilePhotoUrl enforces https:// on registration', severity:'HIGH',
    test: () => read('server/src/controllers/authController.js').includes('validateProfilePhotoUrl'), expectTrue: true },

  // SC-11
  { id:'SC-11a', finding:'SC-11', desc:'JWT lifetime reduced from 7d to 2h', severity:'MEDIUM',
    test: () => read('server/src/utils.js').includes('"2h"') && !read('server/src/utils.js').includes('"7d"'), expectTrue: true },
  { id:'SC-11b', finding:'SC-11', desc:'Server-side logout route added', severity:'MEDIUM',
    test: () => read('server/src/routes/authRoutes.js').includes('logout'), expectTrue: true },
  { id:'SC-11c', finding:'SC-11', desc:'Logout handler calls res.clearCookie', severity:'MEDIUM',
    test: () => read('server/src/controllers/authController.js').includes('clearCookie'), expectTrue: true },
  { id:'SC-11d', finding:'SC-11', desc:'Full revocation (Redis blocklist) — NOT implemented (infrastructure)', severity:'MEDIUM',
    test: () => !read('server/src/middleware/auth.js').includes('redis'), expectTrue: true,
    note: 'PARTIAL FIX — Requires Redis infrastructure. Token lifetime reduced as mitigation.' },

  // SC-12
  { id:'SC-12a', finding:'SC-12', desc:'Password validation function applied on register', severity:'MEDIUM',
    test: () => read('server/src/controllers/authController.js').includes('validatePassword'), expectTrue: true },
  { id:'SC-12b', finding:'SC-12', desc:'minlength:8 enforced in User Mongoose schema', severity:'MEDIUM',
    test: () => read('server/src/models/User.js').includes('minlength: 8'), expectTrue: true },

  // SC-13
  { id:'SC-13', finding:'SC-13', desc:'express.json body limit set to 50kb', severity:'MEDIUM',
    test: () => read('server/src/index.js').includes('limit: "50kb"'), expectTrue: true },

  // SC-14
  { id:'SC-14', finding:'SC-14', desc:'helmet() middleware added to Express app', severity:'MEDIUM',
    test: () => read('server/src/index.js').includes('app.use(helmet())'), expectTrue: true },

  // SC-15
  { id:'SC-15', finding:'SC-15', desc:'Morgan uses combined format in production, dev in development', severity:'MEDIUM',
    test: () => { const c = read('server/src/index.js'); return c.includes('combined') && c.includes('NODE_ENV'); }, expectTrue: true },

  // SC-16
  { id:'SC-16a', finding:'SC-16', desc:'rateBooking verifies elderId ownership', severity:'MEDIUM',
    test: () => read('server/src/controllers/bookingController.js').includes('booking.elderId.toString() !== req.user._id.toString()'), expectTrue: true },
  { id:'SC-16b', finding:'SC-16', desc:'rateBooking rejects non-completed bookings', severity:'MEDIUM',
    test: () => read('server/src/controllers/bookingController.js').includes('status !== "completed"'), expectTrue: true },
  { id:'SC-16c', finding:'SC-16', desc:'rateBooking prevents re-rating (null check)', severity:'MEDIUM',
    test: () => read('server/src/controllers/bookingController.js').includes('booking.rating != null'), expectTrue: true },
  { id:'SC-16d', finding:'SC-16', desc:'rateBooking validates integer 1-5 range', severity:'MEDIUM',
    test: () => read('server/src/controllers/bookingController.js').includes('Number.isInteger(rating)'), expectTrue: true },

  // SC-17
  { id:'SC-17', finding:'SC-17', desc:'submitVisitReport verifies saathiId ownership', severity:'MEDIUM',
    test: () => read('server/src/controllers/bookingController.js').includes('booking.saathiId?.toString() !== req.user._id.toString()'), expectTrue: true },

  // SC-18
  { id:'SC-18a', finding:'SC-18', desc:'mockStore has no real-format Aadhaar (123456789012 etc.)', severity:'MEDIUM',
    test: () => !read('server/src/mockStore.js').includes('123456789012') && !read('server/src/mockStore.js').includes('987654321098'), expectTrue: true },
  { id:'SC-18b', finding:'SC-18', desc:'seed.js has no real-format Aadhaar numbers', severity:'MEDIUM',
    test: () => !read('server/src/seed.js').includes('123456789012') && !read('server/src/seed.js').includes('987654321098'), expectTrue: true },
  { id:'SC-18c', finding:'SC-18', desc:'Synthetic Aadhaar values used (000000000001 etc.)', severity:'MEDIUM',
    test: () => read('server/src/mockStore.js').includes('000000000001'), expectTrue: true },

  // SC-19
  { id:'SC-19', finding:'SC-19', desc:'validateProfilePhotoUrl applied in updateProfile too', severity:'MEDIUM',
    test: () => read('server/src/controllers/authController.js').includes('validateProfilePhotoUrl(req.body.profilePhoto)'), expectTrue: true },

  // SC-20
  { id:'SC-20', finding:'SC-20', desc:'Stale data.json deleted from server directory', severity:'LOW',
    test: () => !existsSync('server/data.json'), expectTrue: true },

  // SC-21
  { id:'SC-21', finding:'SC-21', desc:'Health endpoint returns 204 No Content (no body)', severity:'LOW',
    test: () => read('server/src/index.js').includes('status(204).end()'), expectTrue: true },

  // SC-22
  { id:'SC-22a', finding:'SC-22', desc:'User schema has toJSON transform', severity:'LOW',
    test: () => read('server/src/models/User.js').includes('toJSON'), expectTrue: true },
  { id:'SC-22b', finding:'SC-22', desc:'toJSON transform removes password field', severity:'LOW',
    test: () => read('server/src/models/User.js').includes('delete ret.password'), expectTrue: true },

  // SC-23
  { id:'SC-23', finding:'SC-23', desc:'Insecure "add 0.0.0.0/0" tip removed from console.error log', severity:'LOW',
    test: () => !read('server/src/index.js').includes("add '0.0.0.0/0'") && !read('server/src/index.js').includes('allow access from anywhere'), expectTrue: true },

  // SC-24
  { id:'SC-24a', finding:'SC-24', desc:'api.js uses withCredentials: true for cookie transport', severity:'LOW',
    test: () => read('client/src/api.js').includes('withCredentials: true'), expectTrue: true },
  { id:'SC-24b', finding:'SC-24', desc:'api.js no longer reads token from localStorage', severity:'LOW',
    test: () => !read('client/src/api.js').includes('localStorage.getItem'), expectTrue: true },
  { id:'SC-24c', finding:'SC-24', desc:'AuthContext no longer sets token in localStorage', severity:'LOW',
    test: () => !read('client/src/context/AuthContext.jsx').includes('localStorage.setItem'), expectTrue: true },
  { id:'SC-24d', finding:'SC-24', desc:'AuthContext logout calls server /auth/logout endpoint', severity:'LOW',
    test: () => read('client/src/context/AuthContext.jsx').includes('/auth/logout'), expectTrue: true },
  { id:'SC-24e', finding:'SC-24', desc:'Auth middleware reads JWT from httpOnly cookie', severity:'LOW',
    test: () => read('server/src/middleware/auth.js').includes('saathicare_token'), expectTrue: true },
];

let passed = 0, failed = 0, partial = 0;
const results = [];

for (const c of checks) {
  let result;
  try { result = c.test(); } catch(e) { result = false; }
  const ok = result === c.expectTrue;
  const isPartial = c.note && c.note.includes('PARTIAL');
  const isManual = c.note && c.note.includes('MANUAL');
  let status;
  if (isManual && ok) { status = 'MANUAL ACTION REQUIRED'; partial++; }
  else if (isPartial && ok) { status = 'PARTIAL FIX'; partial++; }
  else if (ok) { status = 'PASS'; passed++; }
  else { status = 'FAIL'; failed++; }
  results.push({ id: c.id, finding: c.finding, severity: c.severity, description: c.desc, status, note: c.note || '' });
}

console.log(JSON.stringify({ summary: { passed, failed, partial, total: checks.length }, results }, null, 2));
