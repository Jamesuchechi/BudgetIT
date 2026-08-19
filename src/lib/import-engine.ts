/**
 * Intelligent Import & Validation Engine — BudgetIT
 * Fuzzy column matching, pre-flight data validation, date parsing, duplicate detection, and template saving.
 */

export type SchemaField =
  | "category"
  | "department"
  | "budgeted_amount"
  | "actual_amount"
  | "period"
  | "vendor"
  | "notes"
  | "date";

export const SCHEMA_FIELDS: { key: SchemaField; label: string; required: boolean }[] = [
  { key: "category", label: "Category / GL Account", required: true },
  { key: "department", label: "Department / Cost Center", required: true },
  { key: "budgeted_amount", label: "Budgeted Amount ($)", required: true },
  { key: "actual_amount", label: "Actual Spend ($)", required: true },
  { key: "period", label: "Fiscal Period", required: true },
  { key: "date", label: "Transaction Date", required: false },
  { key: "vendor", label: "Vendor / Merchant", required: false },
  { key: "notes", label: "Notes / Memo", required: false },
];

export type PresetType = "generic" | "quickbooks" | "xero" | "stripe" | "ramp" | "brex";

export interface SourcePreset {
  id: PresetType;
  name: string;
  description: string;
  mapping: Record<string, SchemaField>;
}

export const SOURCE_PRESETS: SourcePreset[] = [
  {
    id: "generic",
    name: "Generic CSV / Excel",
    description: "Standard spreadsheet with Category, Department, Budget, and Actual columns",
    mapping: {},
  },
  {
    id: "quickbooks",
    name: "QuickBooks Online",
    description: "Export from QuickBooks GL Account & Class reports",
    mapping: {
      "Account": "category",
      "Class": "department",
      "Budget Amount": "budgeted_amount",
      "Actual Amount": "actual_amount",
      "Date": "date",
      "Name": "vendor",
      "Memo/Description": "notes",
    },
  },
  {
    id: "xero",
    name: "Xero Accounting",
    description: "Export from Xero General Ledger & Tracking Category summary",
    mapping: {
      "Account Name": "category",
      "Tracking Category": "department",
      "Budget": "budgeted_amount",
      "Net Amount": "actual_amount",
      "Date": "date",
      "Contact": "vendor",
      "Description": "notes",
    },
  },
  {
    id: "stripe",
    name: "Stripe Payouts / Billing",
    description: "Stripe balance transactions & fees export",
    mapping: {
      "Description": "category",
      "Reporting Category": "department",
      "Amount": "actual_amount",
      "Created (UTC)": "date",
      "Customer Email": "vendor",
    },
  },
  {
    id: "ramp",
    name: "Ramp Corporate Cards",
    description: "Ramp spend management transaction logs",
    mapping: {
      "Category": "category",
      "Department": "department",
      "Amount": "actual_amount",
      "Transaction Date": "date",
      "Merchant": "vendor",
      "Memo": "notes",
    },
  },
  {
    id: "brex",
    name: "Brex Corporate Cards",
    description: "Brex expense export report",
    mapping: {
      "Category Name": "category",
      "Department": "department",
      "Amount ($)": "actual_amount",
      "Date": "date",
      "Vendor": "vendor",
      "Note": "notes",
    },
  },
];

/**
 * Fuzzy matcher to automatically guess column mappings for incoming CSV/Excel headers.
 */
export function guessColumnMapping(headers: string[]): Record<string, SchemaField | ""> {
  const mapping: Record<string, SchemaField | ""> = {};

  for (const h of headers) {
    const norm = h.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    let matched: SchemaField | "" = "";

    if (norm.includes("category") || norm.includes("glaccount") || norm.includes("account")) {
      matched = "category";
    } else if (norm.includes("department") || norm.includes("costcenter") || norm.includes("class") || norm.includes("team")) {
      matched = "department";
    } else if (norm.includes("budgeted") || norm.includes("budgetamount") || norm.includes("plan")) {
      matched = "budgeted_amount";
    } else if (norm.includes("actual") || norm.includes("spend") || norm.includes("spent") || norm.includes("amount") || norm.includes("price") || norm.includes("cost")) {
      matched = "actual_amount";
    } else if (norm.includes("period") || norm.includes("quarter") || norm.includes("fiscal")) {
      matched = "period";
    } else if (norm.includes("date") || norm.includes("created") || norm.includes("txndate")) {
      matched = "date";
    } else if (norm.includes("vendor") || norm.includes("merchant") || norm.includes("supplier") || norm.includes("payee") || norm.includes("contact")) {
      matched = "vendor";
    } else if (norm.includes("note") || norm.includes("memo") || norm.includes("comment") || norm.includes("description")) {
      matched = "notes";
    }

    mapping[h] = matched;
  }

  return mapping;
}

/**
 * Saved Column Mapping Templates in LocalStorage
 */
export interface MappingTemplate {
  id: string;
  name: string;
  mapping: Record<string, SchemaField | "">;
  createdAt: string;
}

const TEMPLATES_KEY = "budgetit_import_mapping_templates";

export function getSavedMappingTemplates(): MappingTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMappingTemplate(name: string, mapping: Record<string, SchemaField | "">): MappingTemplate {
  const templates = getSavedMappingTemplates();
  const newTpl: MappingTemplate = {
    id: `tpl-${Date.now()}`,
    name,
    mapping,
    createdAt: new Date().toISOString(),
  };
  templates.push(newTpl);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  return newTpl;
}

/**
 * Dry-Run Pre-Flight Validation Rule Engine
 */
export interface ValidatedRow {
  rowIndex: number;
  originalData: Record<string, string>;
  mappedData: {
    category: string;
    department: string;
    budgeted_amount: number;
    actual_amount: number;
    period: string;
    date: string;
    vendor: string;
    notes: string;
  };
  errors: string[];
  warnings: string[];
  isDuplicate: boolean;
  isValid: boolean;
}

export function parseFlexibleDate(dateStr: string): string {
  if (!dateStr || !dateStr.trim()) return new Date().toISOString().split("T")[0];
  const str = dateStr.trim();

  // Already ISO format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  // MM/DD/YYYY or DD/MM/YYYY
  const parts = str.split(/[/.\-]/);
  if (parts.length === 3) {
    let p0 = parseInt(parts[0], 10);
    let p1 = parseInt(parts[1], 10);
    let p2 = parseInt(parts[2], 10);

    if (parts[2].length === 4) {
      // MM/DD/YYYY or DD/MM/YYYY
      const month = p0 <= 12 ? p0 : p1;
      const day = p0 <= 12 ? p1 : p0;
      const year = p2;
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }

  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split("T")[0];
  }
  return new Date().toISOString().split("T")[0];
}

export function sanitizeAmount(val: string): number {
  if (!val) return 0;
  const clean = val.replace(/[^0-9.\-]/g, "");
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

export function validatePreFlight(
  rows: Record<string, string>[],
  mapping: Record<string, SchemaField | "">,
  existingEntries: { date?: string; vendor?: string | null; actual_amount?: number; category?: string }[] = [],
): ValidatedRow[] {
  const invMapping: Partial<Record<SchemaField, string>> = {};
  for (const [csvCol, field] of Object.entries(mapping)) {
    if (field) invMapping[field] = csvCol;
  }

  const seenKeys = new Set<string>();
  for (const ex of existingEntries) {
    if (ex.vendor && ex.actual_amount !== undefined) {
      const k = `${ex.date || ""}-${ex.vendor.toLowerCase()}-${ex.actual_amount}`;
      seenKeys.add(k);
    }
  }

  return rows.map((r, idx) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const category = invMapping.category ? (r[invMapping.category] ?? "").trim() : "";
    const department = invMapping.department ? (r[invMapping.department] ?? "").trim() : "";
    const period = invMapping.period ? (r[invMapping.period] ?? "").trim() : "2026-Q1";
    const rawBudgeted = invMapping.budgeted_amount ? r[invMapping.budgeted_amount] : "0";
    const rawActual = invMapping.actual_amount ? r[invMapping.actual_amount] : "0";
    const rawDate = invMapping.date ? r[invMapping.date] : "";
    const vendor = invMapping.vendor ? (r[invMapping.vendor] ?? "").trim() : "";
    const notes = invMapping.notes ? (r[invMapping.notes] ?? "").trim() : "";

    const budgeted_amount = sanitizeAmount(rawBudgeted);
    const actual_amount = sanitizeAmount(rawActual);
    const date = parseFlexibleDate(rawDate);

    if (!category) errors.push("Missing mandatory Category");
    if (!department) errors.push("Missing mandatory Department");
    if (!period) errors.push("Missing Fiscal Period");

    if (actual_amount === 0 && budgeted_amount === 0) {
      warnings.push("Both Budgeted and Actual amounts are $0");
    }

    if (actual_amount < 0) {
      warnings.push("Negative actual spend amount (Refund/Rebate)");
    }

    // Duplicate detection matching date + vendor + amount
    const txnKey = `${date}-${vendor.toLowerCase()}-${actual_amount}`;
    let isDuplicate = false;
    if (vendor && actual_amount > 0 && seenKeys.has(txnKey)) {
      isDuplicate = true;
      warnings.push(`Potential duplicate transaction (${vendor} $${actual_amount})`);
    } else if (vendor && actual_amount > 0) {
      seenKeys.add(txnKey);
    }

    return {
      rowIndex: idx + 1,
      originalData: r,
      mappedData: {
        category: category || "Uncategorized",
        department: department || "General",
        budgeted_amount,
        actual_amount,
        period,
        date,
        vendor,
        notes,
      },
      errors,
      warnings,
      isDuplicate,
      isValid: errors.length === 0,
    };
  });
}
