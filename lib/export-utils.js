import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const formatAmount = (amount) => `${Number(amount || 0).toFixed(2)}`;

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
};

const downloadBlob = (blob, fileName) => {
  const link = document.createElement("a");
  const url = window.URL.createObjectURL(blob);
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const exportTransactions = ({
  transactions,
  format,
  fileName = "transactions",
}) => {
  const headers = [
    "Date",
    "Description",
    "Category",
    "Type",
    "Amount",
    "Recurring",
    "Account",
  ];

  // 1. HANDLE CSV EXPORT
  if (format === "csv") {
    const rows = transactions.map((transaction) => ({
      Date: formatDate(transaction.date),
      Description: transaction.description || "-",
      Category: transaction.category || "-",
      Type: transaction.type || "-",
      Amount: `${transaction.type === "EXPENSE" ? "-" : "+"}${formatAmount(transaction.amount)}`,
      Recurring: transaction.isRecurring ? "Yes" : "No",
      Account: transaction.accountName || "-",
    }));

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    downloadBlob(blob, `${fileName}.csv`);
    return;
  }

  // 2. HANDLE EXCEL EXPORT (with polished auto-column widths)
  if (format === "excel") {
    const rows = transactions.map((transaction) => ({
      Date: formatDate(transaction.date),
      Description: transaction.description || "-",
      Category: transaction.category || "-",
      Type: transaction.type || "-",
      Amount: `${transaction.type === "EXPENSE" ? "-" : "+"}${formatAmount(transaction.amount)}`,
      Recurring: transaction.isRecurring ? "Yes" : "No",
      Account: transaction.accountName || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    
    // Calculate and set automatic widths for columns so they don't clip text
    const columnWidths = headers.map((header) => {
      const maxTextLength = Math.max(
        header.length,
        ...rows.map((row) => String(row[header] || "").length)
      );
      return { wch: maxTextLength + 3 }; // adding comfortable padding
    });
    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    downloadBlob(blob, `${fileName}.xlsx`);
    return;
  }

  // 3. HANDLE PDF EXPORT (Beautifully formatted with jspdf-autotable)
  if (format === "pdf") {
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

    // Document Header Styling
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59); // Deep Slate
    doc.text("Transaction Statement", 40, 55);

    // Subtitle Metadata
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Light Slate
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 40, 75);
    doc.text(`Total Records: ${transactions.length}`, 40, 90);

    // Build cleaner data grid arrays for autotable
    const tableHeaders = ["Date", "Description", "Category", "Type", "Amount", "Recurring"];
    const tableRows = transactions.map((t) => [
      formatDate(t.date),
      t.description || "-",
      t.category || "-",
      t.type || "-",
      `${t.type === "EXPENSE" ? "-" : "+"}Rs.${formatAmount(t.amount)}`,
      t.isRecurring ? "Yes" : "No",
    ]);

    // Draw the gorgeous layout matrix
    autoTable(doc, {
      startY: 115,
      head: [tableHeaders],
      body: tableRows,
      theme: "striped",
      headStyles: {
        fillColor: [79, 70, 229], // Modern Indigo Header
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
        halign: "left",
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [51, 65, 85], // Off-black text
      },
      columnStyles: {
        4: { halign: "right", fontStyle: "bold" }, // Right align the amount
      },
      // Conditional formatting: Color code Income vs Expenses
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 4) {
          const cellValue = data.cell.raw || "";
          if (cellValue.startsWith("-")) {
            data.cell.styles.textColor = [220, 38, 38]; // Red-600 for expenses
          } else if (cellValue.startsWith("+")) {
            data.cell.styles.textColor = [22, 163, 74]; // Green-600 for income
          }
        }
      },
      margin: { left: 40, right: 40, bottom: 40 },
    });

    // Add Dynamic Page Number Footers
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184); // Muted gray
      doc.text(
        `Page ${i} of ${totalPages}`,
        doc.internal.pageSize.getWidth() - 40,
        doc.internal.pageSize.getHeight() - 20,
        { align: "right" }
      );
    }

    doc.save(`${fileName}.pdf`);
    return;
  }

  throw new Error("Unsupported export format");
};