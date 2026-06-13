import os
import openpyxl

def parse_report(filepath):
    try:
        if not os.path.exists(filepath):
            print(f"File not found: {filepath}")
            return {}, []
        wb = openpyxl.load_workbook(filepath, data_only=True)
        
        # Parse Summary
        ws_summary = wb['Summary']
        rows = list(ws_summary.values)
        headers = [str(h) for h in rows[0]]
        data = rows[1]
        summary_dict = dict(zip(headers, data))
        
        # Parse Test Details
        ws_details = wb['Test Details']
        detail_rows = list(ws_details.values)
        detail_headers = [str(h) for h in detail_rows[0]]
        details = []
        for r in detail_rows[1:]:
            if r and r[0] is not None:
                details.append(dict(zip(detail_headers, r)))
            
        return summary_dict, details
    except Exception as e:
        print(f"Error parsing {filepath}: {e}")
        return {}, []

def add_section(markdown_output, summary, details, title, icon):
    if not summary:
        return
    markdown_output.append(f"## {icon} {title} Summary")
    markdown_output.append("| Metric | Value |")
    markdown_output.append("|---|---|")
    markdown_output.append(f"| **Test Suite** | {summary.get('Test Suite', title)} |")
    markdown_output.append(f"| **Total Test Cases** | {summary.get('Total Tests', len(details))} |")
    markdown_output.append(f"| **Passed** | ✅ {summary.get('Passed', 'N/A')} |")
    markdown_output.append(f"| **Failed** | ❌ {summary.get('Failed', 'N/A')} |")
    markdown_output.append(f"| **Pass Rate** | **{summary.get('Pass Rate %', 'N/A')}%** |")
    markdown_output.append(f"| **Duration** | {summary.get('Duration (sec)', 'N/A')} sec |")
    markdown_output.append(f"| **Timestamp** | {summary.get('End Time', 'N/A')} |")
    markdown_output.append("\n")
    
    if details:
        markdown_output.append(f"### 📋 {title} Detail Breakdowns")
        markdown_output.append(f"<details><summary>Click to view all {title} Cases ({len(details)} tests)</summary>\n")
        markdown_output.append("| No. | Category | Test Name | Status |")
        markdown_output.append("|---|---|---|---|")
        for r in details:
            status_emoji = "✅ PASSED" if str(r.get("Status")).upper() == "PASSED" else "❌ FAILED"
            markdown_output.append(f"| {r.get('No.', '-')} | {r.get('Category', '-')} | `{r.get('Test Name', '-')}` | {status_emoji} |")
        markdown_output.append("\n</details>\n")

def main():
    import sys
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')

    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    reports = [
        ("Mobile App Security Test", "app security test.xlsx", "🔐"),
        ("Mobile App Selenium Testing", "app seleium testing.xlsx", "📱"),
        ("Backend Saathi Care Result", "backend saati care result.xlsx", "⚙️"),
        ("Frontend Saathi Care Result", "frontend saathi care result.xlsx", "💻")
    ]
    
    markdown_output = []
    markdown_output.append("# 🧪 SaathiCare Full Test Verification Dashboard\n")
    markdown_output.append("This dashboard displays the test results verified from the completed test execution reports for the entire system.\n")
    
    for title, filename, icon in reports:
        filepath = os.path.join(project_root, filename)
        summary, details = parse_report(filepath)
        add_section(markdown_output, summary, details, title, icon)

    markdown_output.append("## 📦 Downloadable Test Report Artifacts")
    markdown_output.append("The full Excel spreadsheets (`.xlsx`) containing detailed worksheets are uploaded as artifacts for this workflow run and can be downloaded from the **Artifacts** section at the top of the page.")
    
    full_markdown = "\n".join(markdown_output)
    
    summary_file = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_file:
        with open(summary_file, "w", encoding="utf-8") as f:
            f.write(full_markdown)
        print("Successfully published test results to GitHub Step Summary!")
    else:
        print(full_markdown)

if __name__ == "__main__":
    main()
