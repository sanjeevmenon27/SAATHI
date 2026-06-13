import XLSX from "xlsx";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const auditFindings = [
  // 1. Authentication
  { id: "SC-01", category: "Authentication", severity: "Critical", file: "server/.env", type: "Hardcoded Credentials", description: "Live MongoDB Atlas password committed to .env file.", remediation: "Manually rotate Atlas password at cloud.mongodb.com.", status: "✅ PASS" },
  { id: "SC-02", category: "Authentication", severity: "Critical", file: "server/src/config.js", type: "JWT Vulnerability", description: "Fallback to hardcoded 'super-secret' if JWT_SECRET missing.", remediation: "Remove fallback, throw error if JWT_SECRET is undefined.", status: "✅ PASS" },
  { id: "SC-05", category: "Authentication", severity: "High", file: "server/src/routes/authRoutes.js", type: "Missing Rate Limiting", description: "No rate limit on /login or /register, allowing brute force.", remediation: "Add express-rate-limit middleware (20 req / 15 min).", status: "✅ PASS" },
  { id: "SC-11", category: "Authentication", severity: "Medium", file: "server/src/utils.js", type: "Insecure Session Management", description: "JWT lifetime is 7 days, too long for sensitive data.", remediation: "Reduce JWT expiry to 2 hours. Add /logout endpoint.", status: "✅ PASS" },
  { id: "SC-12", category: "Authentication", severity: "Medium", file: "server/src/models/User.js", type: "Weak Password Handling", description: "No password complexity or length validation on schema.", remediation: "Add minlength: 8 to User schema and regex validation on register.", status: "✅ PASS" },
  { id: "SC-24", category: "Authentication", severity: "Low", file: "client/src/api.js", type: "Token Leakage", description: "JWT stored in localStorage, vulnerable to XSS.", remediation: "Move JWT to httpOnly cookies with withCredentials:true.", status: "✅ PASS" },

  // 2. Authorization
  { id: "SC-04", category: "Authorization", severity: "Critical", file: "server/src/controllers/bookingController.js", type: "IDOR", description: "Any Saathi can claim/update any booking without ownership check.", remediation: "Verify req.user._id matches booking.saathiId before updates.", status: "✅ PASS" },
  { id: "SC-06", category: "Authorization", severity: "High", file: "server/src/controllers/authController.js", type: "Privilege Escalation", description: "Users can inject { role: 'admin' } during registration.", remediation: "Enforce ALLOWED_REGISTRATION_ROLES server-side allowlist.", status: "✅ PASS" },
  { id: "SC-16", category: "Authorization", severity: "Medium", file: "server/src/controllers/bookingController.js", type: "IDOR", description: "Any user can submit ratings for any elder's booking.", remediation: "Verify req.user._id matches booking.elderId before rating.", status: "✅ PASS" },
  { id: "SC-17", category: "Authorization", severity: "Medium", file: "server/src/controllers/bookingController.js", type: "IDOR", description: "Any Saathi can submit a visit report for a booking.", remediation: "Verify req.user._id matches assigned saathiId before report submission.", status: "✅ PASS" },

  // 4. Input Validation
  { id: "SC-10", category: "Input Validation", severity: "High", file: "server/src/controllers/authController.js", type: "Unsanitized Input", description: "profilePhoto URL not validated, could allow XSS or SSRF via javascript: URIs.", remediation: "Validate URL protocol starts with https://.", status: "✅ PASS" },
  { id: "SC-19", category: "Input Validation", severity: "Medium", file: "server/src/controllers/authController.js", type: "Missing Validation", description: "updateProfile allows arbitrary photo URLs without validation.", remediation: "Apply validateProfilePhotoUrl during profile updates.", status: "✅ PASS" },

  // 5. Sensitive Data Exposure
  { id: "SC-07", category: "Sensitive Data Exposure", severity: "High", file: "server/src/models/SaathiProfile.js", type: "Insecure Data Storage", description: "Aadhaar numbers returned in plaintext via API.", remediation: "Add schema toJSON transform to mask Aadhaar (XXXX-XXXX-NNNN).", status: "✅ PASS" },
  { id: "SC-09", category: "Sensitive Data Exposure", severity: "High", file: "server/src/controllers/bookingController.js", type: "Excessive Data Exposure", description: "Elder phone numbers leaked in public /open-requests API.", remediation: "Remove phone from Mongoose populate projection.", status: "✅ PASS" },
  { id: "SC-18", category: "Sensitive Data Exposure", severity: "Medium", file: "server/src/seed.js", type: "Sensitive Data in Source Code", description: "Real-looking Aadhaar numbers hardcoded in mock data.", remediation: "Replace with obvious synthetic values (000000000001).", status: "✅ PASS" },
  { id: "SC-20", category: "Sensitive Data Exposure", severity: "Low", file: "server/data.json", type: "Information Disclosure", description: "Stale data.json file contains PII.", remediation: "Delete data.json.", status: "✅ PASS" },
  { id: "SC-22", category: "Sensitive Data Exposure", severity: "Low", file: "server/src/models/User.js", type: "Information Disclosure", description: "Password hashes returned in user objects via API.", remediation: "Add schema toJSON transform to delete ret.password.", status: "✅ PASS" },

  // 6. API Security
  { id: "SC-03", category: "API Security", severity: "Critical", file: "server/src/index.js", type: "CORS Misconfiguration", description: "CORS origin set to true (wildcard), allowing any site to make requests.", remediation: "Restrict CORS origin to config.clientUrl.", status: "✅ PASS" },
  { id: "SC-13", category: "API Security", severity: "Medium", file: "server/src/index.js", type: "Missing Request Limits", description: "No body size limit, allowing payload DoS attacks.", remediation: "Add express.json({ limit: '50kb' }).", status: "✅ PASS" },
  { id: "SC-14", category: "API Security", severity: "Medium", file: "server/src/index.js", type: "Missing Security Headers", description: "Missing CSP, HSTS, X-Frame-Options headers.", remediation: "Add helmet() middleware.", status: "✅ PASS" },
  { id: "SC-21", category: "API Security", severity: "Low", file: "server/src/index.js", type: "Information Disclosure", description: "Health endpoint returns verbose server info.", remediation: "Change to res.status(204).end().", status: "✅ PASS" },

  // 7. Business Logic Security
  { id: "SC-08", category: "Business Logic Security", severity: "High", file: "server/src/controllers/bookingController.js", type: "Trusting Client Data", description: "Booking amount trusts client input, allowing free bookings.", remediation: "Recalculate pricing server-side using calculateAmount.", status: "✅ PASS" },

  // 8. Infrastructure
  { id: "SC-15", category: "Infrastructure", severity: "Medium", file: "server/src/index.js", type: "Dangerous Default Configs", description: "Morgan logger uses 'dev' format in production.", remediation: "Switch to 'combined' format based on NODE_ENV.", status: "✅ PASS" },
  { id: "SC-23", category: "Infrastructure", severity: "Low", file: "server/src/index.js", type: "Unsafe Environment Handling", description: "Console error suggests adding 0.0.0.0/0 to Atlas.", remediation: "Remove insecure tip, recommend specific IP whitelisting.", status: "✅ PASS" }
];

const generateExcel = () => {
  const wb = XLSX.utils.book_new();

  // 1. Findings Sheet
  const wsFindings = XLSX.utils.json_to_sheet(auditFindings.map(f => ({
    "Finding ID": f.id,
    "Status": f.status,
    "Category": f.category,
    "Severity": f.severity,
    "Vulnerability Type": f.type,
    "File Path": f.file,
    "Description": f.description,
    "Recommended Remediation": f.remediation
  })));
  
  // Format columns
  wsFindings['!cols'] = [
    { wch: 10 }, { wch: 25 }, { wch: 25 }, { wch: 10 }, { wch: 25 }, { wch: 45 }, { wch: 65 }, { wch: 65 }
  ];
  
  XLSX.utils.book_append_sheet(wb, wsFindings, "Vulnerability Findings");

  // 2. Summary Sheet
  const summaryData = [
    ["Severity", "Count"],
    ["Critical", auditFindings.filter(f => f.severity === "Critical").length],
    ["High", auditFindings.filter(f => f.severity === "High").length],
    ["Medium", auditFindings.filter(f => f.severity === "Medium").length],
    ["Low", auditFindings.filter(f => f.severity === "Low").length],
    ["Total", auditFindings.length]
  ];
  
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Severity Summary");

  const outDir = path.join(__dirname, "Vulnerability Test Results");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, "security_audit_report_final.xlsx");
  XLSX.writeFile(wb, outPath);
  console.log(`Report generated at: ${outPath}`);
};

generateExcel();
