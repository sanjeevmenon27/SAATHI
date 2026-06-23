/**
 * SaathiCare E2E — Report Generator
 * Generates Excel, HTML, JSON, and Markdown reports
 */
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

class ReportGenerator {
  constructor(reportDir) {
    this.reportDir = reportDir || "./reports";
    this.ensureDir(path.join(this.reportDir, "Excel"));
    this.ensureDir(path.join(this.reportDir, "HTML"));
    this.ensureDir(path.join(this.reportDir, "JSON"));
    this.ensureDir(path.join(this.reportDir, "Summary"));
    this.ensureDir(path.join(this.reportDir, "Screenshots"));
    this.ensureDir(path.join(this.reportDir, "Logs"));
  }

  ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  autoWidth(ws, data) {
    if (!data.length) return;
    ws["!cols"] = Object.keys(data[0]).map(key => ({
      wch: Math.min(Math.max(key.length, ...data.map(r => String(r[key] || "").length)) + 2, 80),
    }));
  }

  generateExcelReport(results) {
    const wb = XLSX.utils.book_new();
    const allTests = results.testDetails;
    const passed = allTests.filter(t => t.Status === "PASSED");
    const failed = allTests.filter(t => t.Status === "FAILED");
    const skipped = allTests.filter(t => t.Status === "SKIPPED");

    // Sheet 1: All Test Cases
    if (allTests.length) {
      const ws1 = XLSX.utils.json_to_sheet(allTests);
      this.autoWidth(ws1, allTests);
      XLSX.utils.book_append_sheet(wb, ws1, "Executed Test Cases");
    }

    // Sheet 2: Passed
    if (passed.length) {
      const ws2 = XLSX.utils.json_to_sheet(passed);
      this.autoWidth(ws2, passed);
      XLSX.utils.book_append_sheet(wb, ws2, "Passed Tests");
    }

    // Sheet 3: Failed
    if (failed.length) {
      const ws3 = XLSX.utils.json_to_sheet(failed);
      this.autoWidth(ws3, failed);
      XLSX.utils.book_append_sheet(wb, ws3, "Failed Tests");
    }

    // Sheet 4: Skipped
    const ws4 = XLSX.utils.json_to_sheet(skipped.length ? skipped : [{ "No.": "-", Status: "No skipped tests" }]);
    XLSX.utils.book_append_sheet(wb, ws4, "Skipped Tests");

    // Sheet 5: Execution Metrics
    const categories = {};
    allTests.forEach(t => {
      if (!categories[t.Category]) categories[t.Category] = { total: 0, passed: 0, failed: 0, skipped: 0 };
      categories[t.Category].total++;
      if (t.Status === "PASSED") categories[t.Category].passed++;
      else if (t.Status === "FAILED") categories[t.Category].failed++;
      else categories[t.Category].skipped++;
    });
    const metrics = Object.entries(categories).map(([cat, v]) => ({
      Module: cat, Total: v.total, Passed: v.passed, Failed: v.failed, Skipped: v.skipped,
      "Pass Rate": ((v.passed / v.total) * 100).toFixed(1) + "%",
    }));
    metrics.push({
      Module: "TOTAL", Total: allTests.length, Passed: passed.length, Failed: failed.length, Skipped: skipped.length,
      "Pass Rate": ((passed.length / allTests.length) * 100).toFixed(1) + "%",
    });
    const ws5 = XLSX.utils.json_to_sheet(metrics);
    this.autoWidth(ws5, metrics);
    XLSX.utils.book_append_sheet(wb, ws5, "Execution Metrics");

    // Sheet 6: Defect Summary
    const defects = failed.map((t, i) => ({
      "Defect #": `DEF-${String(i + 1).padStart(3, "0")}`,
      "Test ID": t["Test ID"],
      Module: t.Category,
      "Test Name": t["Test Name"],
      Severity: t.Priority || "Medium",
      "Error Details": t["Error Details"] || t.Error || "",
    }));
    const ws6 = XLSX.utils.json_to_sheet(defects.length ? defects : [{ "Defect #": "-", Module: "No defects" }]);
    this.autoWidth(ws6, defects.length ? defects : [{ "Defect #": "-", Module: "No defects" }]);
    XLSX.utils.book_append_sheet(wb, ws6, "Defect Summary");

    // Sheet 7: Summary
    const summaryData = [
      ["Test Suite", "Total Tests", "Passed", "Failed", "Skipped", "Pass Rate %", "Duration (sec)", "Start Time", "End Time"],
      [results.summary.testSuite, results.summary.total, results.summary.passed, results.summary.failed,
       results.summary.skipped || 0, parseFloat(results.summary.passRate), parseFloat(results.summary.duration),
       results.summary.startTime, results.summary.endTime]
    ];
    const ws7 = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws7, "Summary");

    const mainPath = path.join(this.reportDir, "Excel", "Automation_Test_Report.xlsx");
    XLSX.writeFile(wb, mainPath);

    // Separate passed/failed/summary workbooks
    if (passed.length) {
      const wbP = XLSX.utils.book_new();
      const wsP = XLSX.utils.json_to_sheet(passed);
      this.autoWidth(wsP, passed);
      XLSX.utils.book_append_sheet(wbP, wsP, "Passed Tests");
      XLSX.writeFile(wbP, path.join(this.reportDir, "Excel", "Passed_Test_Cases.xlsx"));
    }
    if (failed.length) {
      const wbF = XLSX.utils.book_new();
      const wsF = XLSX.utils.json_to_sheet(failed);
      this.autoWidth(wsF, failed);
      XLSX.utils.book_append_sheet(wbF, wsF, "Failed Tests");
      XLSX.writeFile(wbF, path.join(this.reportDir, "Excel", "Failed_Test_Cases.xlsx"));
    }
    const wbS = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wbS, XLSX.utils.json_to_sheet(metrics), "Summary");
    XLSX.writeFile(wbS, path.join(this.reportDir, "Excel", "Summary_Report.xlsx"));

    return mainPath;
  }

  generateHTMLReport(results) {
    const passed = results.summary.passed;
    const failed = results.summary.failed;
    const total = results.summary.total;
    const skipped = results.summary.skipped || 0;
    const passRate = results.summary.passRate;

    const failedRows = results.testDetails
      .filter(t => t.Status === "FAILED")
      .map(t => `<tr><td>${t["Test ID"]}</td><td>${t.Category}</td><td>${t["Test Name"]}</td><td class="fail">FAILED</td><td>${t["Error Details"] || ""}</td></tr>`)
      .join("\n");

    const passedRows = results.testDetails
      .filter(t => t.Status === "PASSED")
      .map(t => `<tr><td>${t["Test ID"]}</td><td>${t.Category}</td><td>${t["Test Name"]}</td><td class="pass">PASSED</td><td>${(t["Time (sec)"] || 0) + "s"}</td></tr>`)
      .join("\n");

    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SaathiCare E2E Test Report</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;background:#0f172a;color:#e2e8f0;padding:2rem}
.header{text-align:center;padding:2rem;background:linear-gradient(135deg,#1e293b,#334155);border-radius:16px;margin-bottom:2rem}
.header h1{font-size:2rem;color:#f8fafc}.header p{color:#94a3b8;margin-top:.5rem}
.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:2rem}
.metric-card{background:#1e293b;border-radius:12px;padding:1.5rem;text-align:center;border:1px solid #334155}
.metric-card .value{font-size:2.5rem;font-weight:700;margin:.5rem 0}
.metric-card .label{color:#94a3b8;font-size:.875rem;text-transform:uppercase}
.pass-card .value{color:#22c55e}.fail-card .value{color:#ef4444}.rate-card .value{color:#3b82f6}.total-card .value{color:#f59e0b}
.chart-container{background:#1e293b;border-radius:12px;padding:2rem;margin-bottom:2rem;text-align:center}
.bar{display:inline-block;height:30px;border-radius:4px;transition:.3s}
.bar.pass{background:#22c55e}.bar.fail{background:#ef4444}.bar.skip{background:#f59e0b}
table{width:100%;border-collapse:collapse;background:#1e293b;border-radius:12px;overflow:hidden;margin-bottom:2rem}
th{background:#334155;padding:12px 16px;text-align:left;font-weight:600;color:#f8fafc}
td{padding:10px 16px;border-bottom:1px solid #334155}.pass{color:#22c55e;font-weight:600}.fail{color:#ef4444;font-weight:600}
tr:hover{background:#263547}details{margin-bottom:1rem}
summary{cursor:pointer;background:#334155;padding:12px 16px;border-radius:8px;font-weight:600}
.footer{text-align:center;padding:2rem;color:#64748b}
</style></head><body>
<div class="header"><h1>🧪 SaathiCare E2E Test Execution Report</h1>
<p>Generated: ${results.summary.endTime} | Duration: ${results.summary.duration}s</p></div>
<div class="metrics">
<div class="metric-card total-card"><div class="label">Total Tests</div><div class="value">${total}</div></div>
<div class="metric-card pass-card"><div class="label">Passed</div><div class="value">${passed}</div></div>
<div class="metric-card fail-card"><div class="label">Failed</div><div class="value">${failed}</div></div>
<div class="metric-card rate-card"><div class="label">Pass Rate</div><div class="value">${passRate}%</div></div>
</div>
<div class="chart-container"><h3 style="margin-bottom:1rem">Test Distribution</h3>
<div style="width:100%;background:#334155;border-radius:8px;overflow:hidden;display:flex">
<div class="bar pass" style="width:${(passed/total*100).toFixed(1)}%;text-align:center;line-height:30px;color:#fff;font-size:12px">${passed} passed</div>
<div class="bar fail" style="width:${(failed/total*100).toFixed(1)}%;text-align:center;line-height:30px;color:#fff;font-size:12px">${failed} failed</div>
${skipped > 0 ? `<div class="bar skip" style="width:${(skipped/total*100).toFixed(1)}%;text-align:center;line-height:30px;color:#fff;font-size:12px">${skipped} skipped</div>` : ""}
</div></div>
${failed > 0 ? `<h2 style="margin:1rem 0">❌ Failed Tests (${failed})</h2><table><tr><th>Test ID</th><th>Module</th><th>Test Name</th><th>Status</th><th>Error</th></tr>${failedRows}</table>` : ""}
<details><summary>✅ Passed Tests (${passed})</summary><table><tr><th>Test ID</th><th>Module</th><th>Test Name</th><th>Status</th><th>Duration</th></tr>${passedRows}</table></details>
<div class="footer"><p>SaathiCare Automated Test Framework — Enterprise Grade E2E Testing</p></div>
</body></html>`;

    const reportPath = path.join(this.reportDir, "HTML", "execution-report.html");
    fs.writeFileSync(reportPath, html);
    return reportPath;
  }

  generateJSONReport(results) {
    const jsonPath = path.join(this.reportDir, "JSON", "execution-results.json");
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
    return jsonPath;
  }

  generateMarkdownSummary(results) {
    const p = results.summary;
    const failedTests = results.testDetails.filter(t => t.Status === "FAILED");
    const md = `# 🧪 SaathiCare E2E Execution Summary

**Deployment URL**: ${results.baseUrl || "N/A"}
**Execution Date**: ${p.endTime}
**Build Status**: ${p.passed === p.total ? "✅ PASS" : "⚠️ PARTIAL"}

## Execution Metrics

| Metric | Value |
|---|---|
| **Total Test Cases** | ${p.total} |
| **Executed** | ${p.total} |
| **Passed** | ✅ ${p.passed} |
| **Failed** | ❌ ${p.failed} |
| **Skipped** | ⏭️ ${p.skipped || 0} |
| **Pass Percentage** | **${p.passRate}%** |
| **Execution Duration** | ${p.duration}s |

## Module Breakdown

| Module | Passed | Failed | Total | Pass Rate |
|---|---|---|---|---|
${Object.entries(results.categoryBreakdown || {}).map(([cat, v]) =>
`| ${cat} | ${v.passed} | ${v.failed} | ${v.total} | ${((v.passed/v.total)*100).toFixed(1)}% |`).join("\n")}

${failedTests.length > 0 ? `## ❌ Failed Tests

| Test ID | Module | Test Name | Error |
|---|---|---|---|
${failedTests.slice(0, 20).map(t => `| ${t["Test ID"]} | ${t.Category} | ${t["Test Name"]} | ${(t["Error Details"] || "").substring(0, 80)} |`).join("\n")}
` : "## ✅ All Tests Passed!"}

## 📦 Artifacts Generated
- ✅ Excel Reports (Automation_Test_Report.xlsx, Passed/Failed/Summary)
- ✅ HTML Report (execution-report.html)
- ✅ JSON Results (execution-results.json)
- ✅ Screenshots
- ✅ Logs
`;

    const mdPath = path.join(this.reportDir, "Summary", "summary.md");
    fs.writeFileSync(mdPath, md);
    return mdPath;
  }

  generateAll(results) {
    const excel = this.generateExcelReport(results);
    const html = this.generateHTMLReport(results);
    const json = this.generateJSONReport(results);
    const md = this.generateMarkdownSummary(results);
    console.log(`\n📊 Reports generated:`);
    console.log(`   Excel: ${excel}`);
    console.log(`   HTML:  ${html}`);
    console.log(`   JSON:  ${json}`);
    console.log(`   MD:    ${md}`);
    return { excel, html, json, md };
  }
}

module.exports = { ReportGenerator };
