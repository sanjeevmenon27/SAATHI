import XLSX from "xlsx";

const filePath = "c:/pdd/E2E_Test_Report_PancreaScan_2026-06-09T16-22-48.xlsx";
const wb = XLSX.readFile(filePath);

console.log("Sheet Names:", wb.SheetNames);

for (const sheetName of wb.SheetNames) {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws);
    if (data.length > 0) {
        console.log("Headers:", Object.keys(data[0]));
        console.log("First Row:", data[0]);
    } else {
        console.log("Empty sheet");
    }
}
