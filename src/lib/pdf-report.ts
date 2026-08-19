/**
 * PDF Executive Report Generator — BudgetIT
 * Generates an executive print-ready PDF layout for financial reports.
 */

import { fmtCurrency } from "./format";

export interface PDFReportData {
  orgName: string;
  reportTitle: string;
  generatedDate: string;
  periodName: string;
  totalBudgeted: number;
  totalActual: number;
  netVariance: number;
  utilization: number;
  byCategory: { name: string; budgeted: number; actual: number; variance: number }[];
  byDepartment: { name: string; budgeted: number; actual: number; variance: number }[];
}

export function generatePDFExecutiveReport(data: PDFReportData): void {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${data.reportTitle} — ${data.orgName}</title>
  <style>
    @media print {
      body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; }
      .no-print { display: none; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 30px;
      color: #0f172a;
      background: #ffffff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-b: 2px solid #e2e8f0;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo-badge {
      font-weight: 900;
      font-size: 24px;
      letter-spacing: -0.5px;
      color: #0f172a;
    }
    .meta {
      text-align: right;
      font-size: 12px;
      color: #64748b;
    }
    .title-section {
      margin-bottom: 25px;
    }
    .title-section h1 {
      font-size: 26px;
      margin: 0;
      font-weight: 800;
    }
    .title-section p {
      margin: 4px 0 0 0;
      font-size: 14px;
      color: #64748b;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 35px;
    }
    .kpi-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      background: #f8fafc;
    }
    .kpi-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      font-family: monospace;
    }
    .kpi-value {
      font-size: 20px;
      font-weight: 800;
      margin-top: 6px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #475569;
      margin-bottom: 12px;
      font-family: monospace;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
      font-size: 13px;
    }
    th {
      background: #f1f5f9;
      text-align: left;
      padding: 10px;
      font-weight: 600;
      border-bottom: 1px solid #cbd5e1;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #e2e8f0;
    }
    .text-right { text-align: right; }
    .font-mono { font-family: monospace; }
    .print-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #0f172a;
      color: #ffffff;
      padding: 12px;
      text-align: center;
      font-size: 14px;
    }
    .print-btn {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      margin-left: 15px;
    }
  </style>
</head>
<body>
  <div class="print-bar no-print">
    Executive Report Generated Successfully.
    <button class="print-btn" onclick="window.print()">Print / Download PDF</button>
  </div>

  <div style="margin-top: 40px;">
    <div class="header">
      <div>
        <div class="logo-badge">BudgetIT</div>
        <div style="font-size: 13px; color: #64748b; margin-top: 4px;">${data.orgName}</div>
      </div>
      <div class="meta">
        <div><strong>Period:</strong> ${data.periodName}</div>
        <div><strong>Generated:</strong> ${data.generatedDate}</div>
      </div>
    </div>

    <div class="title-section">
      <h1>${data.reportTitle}</h1>
      <p>Financial performance, budget vs. actual variance analysis report.</p>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Total Budgeted</div>
        <div class="kpi-value">${fmtCurrency(data.totalBudgeted)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Actual Spent</div>
        <div class="kpi-value">${fmtCurrency(data.totalActual)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Net Variance</div>
        <div class="kpi-value">${fmtCurrency(data.netVariance)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Budget Utilization</div>
        <div class="kpi-value">${(data.utilization * 100).toFixed(1)}%</div>
      </div>
    </div>

    <div class="section-title">Category Variance Rollup</div>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th class="text-right">Budgeted</th>
          <th class="text-right">Actual</th>
          <th class="text-right">Variance</th>
        </tr>
      </thead>
      <tbody>
        ${data.byCategory
          .map(
            (c) => `
          <tr>
            <td><strong>${c.name}</strong></td>
            <td class="text-right font-mono">${fmtCurrency(c.budgeted)}</td>
            <td class="text-right font-mono">${fmtCurrency(c.actual)}</td>
            <td class="text-right font-mono">${fmtCurrency(c.variance)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>

    <div class="section-title">Department Cost-Center Breakdown</div>
    <table>
      <thead>
        <tr>
          <th>Department</th>
          <th class="text-right">Budgeted</th>
          <th class="text-right">Actual</th>
          <th class="text-right">Variance</th>
        </tr>
      </thead>
      <tbody>
        ${data.byDepartment
          .map(
            (d) => `
          <tr>
            <td><strong>${d.name}</strong></td>
            <td class="text-right font-mono">${fmtCurrency(d.budgeted)}</td>
            <td class="text-right font-mono">${fmtCurrency(d.actual)}</td>
            <td class="text-right font-mono">${fmtCurrency(d.variance)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  </div>
</body>
</html>`;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}
