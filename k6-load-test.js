/**
 * SaathiCare — k6 Load Testing Script
 * ====================================
 * Scenarios: Baseline, Stress, Spike, Endurance
 *
 * Usage:
 *   k6 run k6-load-test.js                          # runs all scenarios
 *   k6 run --env SCENARIO=baseline k6-load-test.js   # run only baseline
 *
 * Environment Variables:
 *   BASE_URL  — API base URL (default: https://saathicare.onrender.com)
 *   SCENARIO  — Which scenario to run (baseline|stress|spike|endurance|all)
 */

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

// ── Custom Metrics ────────────────────────────────────────────────────────────
const errorRate = new Rate("errors");
const healthLatency = new Trend("health_latency", true);
const loginLatency = new Trend("login_latency", true);
const apiLatency = new Trend("api_latency", true);
const totalRequests = new Counter("total_requests");

// ── Configuration ─────────────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || "https://saathicare.onrender.com";
const SCENARIO = __ENV.SCENARIO || "baseline";

// ── Scenario Definitions ──────────────────────────────────────────────────────
const scenarios = {
  // BASELINE: 100 concurrent users for 1 minute
  baseline: {
    executor: "constant-vus",
    vus: 100,
    duration: "1m",
    tags: { scenario: "baseline" },
  },

  // STRESS: Ramp from 0 → 200 → 500 → 1000 → 0
  stress: {
    executor: "ramping-vus",
    startVUs: 0,
    stages: [
      { duration: "30s", target: 200 },
      { duration: "30s", target: 200 },
      { duration: "30s", target: 500 },
      { duration: "30s", target: 500 },
      { duration: "30s", target: 1000 },
      { duration: "30s", target: 1000 },
      { duration: "30s", target: 0 },
    ],
    tags: { scenario: "stress" },
  },

  // SPIKE: Sudden jump from 50 to 500 users
  spike: {
    executor: "ramping-vus",
    startVUs: 50,
    stages: [
      { duration: "10s", target: 50 },
      { duration: "5s", target: 500 },
      { duration: "30s", target: 500 },
      { duration: "10s", target: 50 },
      { duration: "15s", target: 50 },
    ],
    tags: { scenario: "spike" },
  },

  // ENDURANCE: 100 users for 30 minutes
  endurance: {
    executor: "constant-vus",
    vus: 100,
    duration: "30m",
    tags: { scenario: "endurance" },
  },
};

// Select scenario(s) to run
function getOptions() {
  if (SCENARIO === "all") {
    return { scenarios };
  }
  if (scenarios[SCENARIO]) {
    return { scenarios: { [SCENARIO]: scenarios[SCENARIO] } };
  }
  // Default to baseline
  return { scenarios: { baseline: scenarios.baseline } };
}

export const options = {
  ...getOptions(),
  thresholds: {
    http_req_duration: ["p(95)<2000", "p(99)<5000"],
    errors: ["rate<0.05"],
    health_latency: ["p(95)<500"],
    login_latency: ["p(95)<3000"],
  },
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
};

// ── Test Data ─────────────────────────────────────────────────────────────────
const testUsers = [
  { email: "priya@example.com", password: "password123" },
  { email: "rahul@example.com", password: "password123" },
  { email: "anita@example.com", password: "password123" },
];

// ── Main Test Function ────────────────────────────────────────────────────────
export default function () {
  const userIndex = __VU % testUsers.length;

  group("Health Check", function () {
    const res = http.get(`${BASE_URL}/api/health`);
    const success = check(res, {
      "health status is 200 or 204": (r) => r.status === 200 || r.status === 204,
      "health response time < 500ms": (r) => r.timings.duration < 500,
    });
    errorRate.add(!success);
    healthLatency.add(res.timings.duration);
    totalRequests.add(1);
  });

  sleep(0.5);

  group("Login Attempt", function () {
    const payload = JSON.stringify(testUsers[userIndex]);
    const params = {
      headers: { "Content-Type": "application/json" },
    };
    const res = http.post(`${BASE_URL}/api/auth/login`, payload, params);
    const success = check(res, {
      "login returns 200 or 400 or 429": (r) =>
        r.status === 200 || r.status === 400 || r.status === 429,
      "login response time < 3s": (r) => r.timings.duration < 3000,
    });
    errorRate.add(!success);
    loginLatency.add(res.timings.duration);
    totalRequests.add(1);
  });

  sleep(0.5);

  group("Landing Page Load", function () {
    const res = http.get(`${BASE_URL}/`);
    const success = check(res, {
      "landing page returns 200": (r) => r.status === 200,
      "landing page has content": (r) => r.body && r.body.length > 100,
      "landing page response time < 2s": (r) => r.timings.duration < 2000,
    });
    errorRate.add(!success);
    apiLatency.add(res.timings.duration);
    totalRequests.add(1);
  });

  sleep(0.3);
}

// ── Summary Handler ───────────────────────────────────────────────────────────
export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    scenario: SCENARIO,
    baseUrl: BASE_URL,
    metrics: {
      rps: data.metrics.http_reqs ? data.metrics.http_reqs.values.rate : 0,
      totalRequests: data.metrics.http_reqs ? data.metrics.http_reqs.values.count : 0,
      avgResponseTime: data.metrics.http_req_duration ? data.metrics.http_req_duration.values.avg : 0,
      minResponseTime: data.metrics.http_req_duration ? data.metrics.http_req_duration.values.min : 0,
      maxResponseTime: data.metrics.http_req_duration ? data.metrics.http_req_duration.values.max : 0,
      medianResponseTime: data.metrics.http_req_duration ? data.metrics.http_req_duration.values.med : 0,
      p90ResponseTime: data.metrics.http_req_duration ? data.metrics.http_req_duration.values["p(90)"] : 0,
      p95ResponseTime: data.metrics.http_req_duration ? data.metrics.http_req_duration.values["p(95)"] : 0,
      p99ResponseTime: data.metrics.http_req_duration ? data.metrics.http_req_duration.values["p(99)"] : 0,
      errorRate: data.metrics.errors ? data.metrics.errors.values.rate : 0,
      healthLatencyP95: data.metrics.health_latency ? data.metrics.health_latency.values["p(95)"] : 0,
      loginLatencyP95: data.metrics.login_latency ? data.metrics.login_latency.values["p(95)"] : 0,
    },
    thresholds: data.thresholds || {},
  };

  return {
    stdout: generateTextSummary(summary),
    "performance-results.json": JSON.stringify(summary, null, 2),
  };
}

function generateTextSummary(s) {
  return `
╔══════════════════════════════════════════════════════════════╗
║         SAATHICARE PERFORMANCE TEST RESULTS                ║
╠══════════════════════════════════════════════════════════════╣
║  Scenario          : ${String(s.scenario).padEnd(37)}║
║  Base URL          : ${String(s.baseUrl).padEnd(37)}║
║  Timestamp         : ${String(s.timestamp).padEnd(37)}║
╠══════════════════════════════════════════════════════════════╣
║  Requests/sec      : ${String(s.metrics.rps.toFixed(2)).padEnd(37)}║
║  Total Requests    : ${String(s.metrics.totalRequests).padEnd(37)}║
║  Error Rate        : ${String((s.metrics.errorRate * 100).toFixed(2) + "%").padEnd(37)}║
╠══════════════════════════════════════════════════════════════╣
║  Avg Response Time : ${String(s.metrics.avgResponseTime.toFixed(2) + " ms").padEnd(37)}║
║  Min Response Time : ${String(s.metrics.minResponseTime.toFixed(2) + " ms").padEnd(37)}║
║  Max Response Time : ${String(s.metrics.maxResponseTime.toFixed(2) + " ms").padEnd(37)}║
║  Median            : ${String(s.metrics.medianResponseTime.toFixed(2) + " ms").padEnd(37)}║
║  P90               : ${String(s.metrics.p90ResponseTime.toFixed(2) + " ms").padEnd(37)}║
║  P95               : ${String(s.metrics.p95ResponseTime.toFixed(2) + " ms").padEnd(37)}║
║  P99               : ${String(s.metrics.p99ResponseTime.toFixed(2) + " ms").padEnd(37)}║
╠══════════════════════════════════════════════════════════════╣
║  Health P95        : ${String(s.metrics.healthLatencyP95.toFixed(2) + " ms").padEnd(37)}║
║  Login P95         : ${String(s.metrics.loginLatencyP95.toFixed(2) + " ms").padEnd(37)}║
╚══════════════════════════════════════════════════════════════╝
`;
}
