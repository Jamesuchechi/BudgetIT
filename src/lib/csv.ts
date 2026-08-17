/**
 * CSV serialisation helpers.
 *
 * Values are neutralised against spreadsheet formula injection: any field that
 * starts with a character Excel/Sheets treats as the start of a formula is
 * prefixed with a single apostrophe so it is read as literal text.
 */

const FORMULA_PREFIX = /^[=+\-@\t\r]/;

export function escapeCSVValue(v: unknown): string {
  let s = String(v ?? "");
  if (FORMULA_PREFIX.test(s)) s = `'${s}`;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCSV(rows: Record<string, string | number>[], headers: string[]): string {
  return [
    headers.map(escapeCSVValue).join(","),
    ...rows.map((r) => headers.map((h) => escapeCSVValue(r[h])).join(",")),
  ].join("\n");
}
