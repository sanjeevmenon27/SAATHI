/**
 * SaathiCare E2E Automation — Configuration
 */
module.exports = {
  BASE_URL: process.env.BASE_URL || "https://saathicare.onrender.com",
  TIMEOUT: parseInt(process.env.TIMEOUT || "10000", 10),
  IMPLICIT_WAIT: parseInt(process.env.IMPLICIT_WAIT || "5000", 10),
  SCREENSHOT_DIR: process.env.SCREENSHOT_DIR || "./reports/Screenshots",
  LOG_DIR: process.env.LOG_DIR || "./reports/Logs",
  REPORT_DIR: process.env.REPORT_DIR || "./reports",
  HEADLESS: process.env.HEADLESS !== "false",
  BROWSER: process.env.BROWSER || "chrome",
  WINDOW_WIDTH: 1920,
  WINDOW_HEIGHT: 1080,
  TEST_DATA: {
    validElderUser: { email: "priya@example.com", password: "password123" },
    validSaathiUser: { email: "rahul@example.com", password: "password123" },
    validAdminUser: { email: "admin@saathicare.com", password: "Admin1234" },
    invalidUser: { email: "invalid@test.com", password: "wrongpassword1" },
    newUser: { name: "Test User", email: `testuser${Date.now()}@test.com`, password: "TestPass123", phone: "9876543210" },
  },
  PAGES: {
    landing: "/",
    login: "/login",
    register: "/register",
    dashboard: "/dashboard",
    profileSetup: "/profile-setup",
  },
};
