import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

interface ExportData {
  headers: string[];
  rows: (string | number | null | undefined)[][];
  filename: string;
  title?: string;
}

export function exportToExcel(data: ExportData): void {
  const worksheet = XLSX.utils.aoa_to_sheet([data.headers, ...data.rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${data.filename}.xlsx`);
}

export function exportToPDF(data: ExportData): void {
  const doc = new jsPDF();

  // Add Bregid header
  doc.setFontSize(18);
  doc.text('BREGID FACTORY', 20, 20);

  if (data.title) {
    doc.setFontSize(12);
    doc.text(data.title, 20, 30);
  }

  // Add date
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 38);

  // Calculate column widths
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const availableWidth = pageWidth - margin * 2;
  const colWidth = Math.min(availableWidth / data.headers.length, 40);

  // Add table header
  let y = 48;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');

  let x = margin;
  data.headers.forEach((header) => {
    doc.text(header, x, y);
    x += colWidth;
  });

  // Add rows
  doc.setFont('helvetica', 'normal');
  y += 6;
  data.rows.forEach((row) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    x = margin;
    row.forEach((cell) => {
      const text = cell !== null && cell !== undefined ? String(cell) : '';
      doc.text(text, x, y);
      x += colWidth;
    });
    y += 6;
  });

  doc.save(`${data.filename}.pdf`);
}
