import * as XLSX from 'xlsx';

// downloadXlsx('report.xlsx', { 'Sheet name': [['Header'], ['value']] })
export function downloadXlsx(fileName, sheets) {
    const workbook = XLSX.utils.book_new();
    Object.entries(sheets).forEach(([name, rows]) => {
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), name.slice(0, 31));
    });
    XLSX.writeFile(workbook, fileName);
}
