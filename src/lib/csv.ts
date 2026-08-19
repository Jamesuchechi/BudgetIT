/**
 * CSV & Excel Serialisation Helpers — BudgetIT
 * Values are neutralised against spreadsheet formula injection.
 */

const FORMULA_PREFIX = /^[=+\-@\t\r]/;

export type CSVDelimiter = "," | ";" | "\t";

export function escapeCSVValue(v: unknown, delimiter: CSVDelimiter = ","): string {
  let s = String(v ?? "");
  if (FORMULA_PREFIX.test(s)) s = `'${s}`;
  const regex = new RegExp(`[",\\n\\r${delimiter === "\t" ? "\\t" : delimiter}]`);
  return regex.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCSV(
  rows: Record<string, string | number>[],
  headers: string[],
  delimiter: CSVDelimiter = ",",
): string {
  return [
    headers.map((h) => escapeCSVValue(h, delimiter)).join(delimiter),
    ...rows.map((r) => headers.map((h) => escapeCSVValue(r[h], delimiter)).join(delimiter)),
  ].join("\n");
}

/**
 * Formatted Microsoft Excel Spreadsheet XML Generator (.xls / .xlsx readable)
 * Generates an Excel Spreadsheet XML document with styled headers and formatted columns.
 */
export function toExcelSpreadsheet(
  title: string,
  rows: Record<string, string | number>[],
  headers: string[],
): string {
  const headerCells = headers
    .map(
      (h) =>
        `<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`,
    )
    .join("");

  const rowCells = rows
    .map((r) => {
      const cells = headers
        .map((h) => {
          const val = r[h];
          const isNum = typeof val === "number";
          return `<Cell ss:StyleID="${isNum ? "NumberStyle" : "TextStyle"}"><Data ss:Type="${isNum ? "Number" : "String"}">${escapeXml(String(val ?? ""))}</Data></Cell>`;
        })
        .join("");
      return `<Row>${cells}</Row>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1E293B" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="TextStyle">
   <Alignment ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="NumberStyle">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="#,##0.00"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${escapeXml(title)}">
  <Table>
   <Row ss:Height="24">${headerCells}</Row>
   ${rowCells}
  </Table>
 </Worksheet>
</Workbook>`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
