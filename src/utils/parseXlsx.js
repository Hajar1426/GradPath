import * as XLSX from 'xlsx';

// Reads the first sheet of an .xlsx, .xls or .csv file into a list of rows.
// Each row is an object keyed by the header text, for example { 'Full name': 'Sara', ... }.
export async function parseXlsx(file) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new Error('The file has no sheets.');
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '', raw: false });
    const headers = (XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 })[0] ?? []).map(String);
    return { rows, headers };
}
