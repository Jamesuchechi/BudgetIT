import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import Papa from "papaparse";
import { PageHeader, PageBody } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentOrgId, useMemberships } from "@/hooks/use-org";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/app/import")({
  component: ImportPage,
});

const REQUIRED_FIELDS = ["category", "department", "budgeted_amount", "actual_amount", "period"] as const;
const OPTIONAL_FIELDS = ["vendor", "notes"] as const;
const ALL_FIELDS = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS] as const;
type Field = (typeof ALL_FIELDS)[number];

const FIELD_LABELS: Record<Field, string> = {
  category: "Category / GL Account *",
  department: "Department / Cost Center *",
  budgeted_amount: "Budgeted Amount *",
  actual_amount: "Actual Spend *",
  period: "Period *",
  vendor: "Vendor",
  notes: "Notes",
};

const TEMPLATE = "Category,Department,Budgeted Amount,Actual Spend,Period,Vendor,Notes\nMarketing,Growth,50000,42315,2026-Q1,LinkedIn,Q1 paid social\nSalaries,Engineering,320000,318200,2026-Q1,,\nSoftware,IT,18000,21430,2026-Q1,AWS,Overage on infra\n";

function guessMap(headers: string[]): Record<string, Field | ""> {
  const out: Record<string, Field | ""> = {};
  for (const h of headers) {
    const n = h.toLowerCase().replace(/[^a-z]/g, "");
    let match: Field | "" = "";
    if (n.includes("category") || n.includes("account") || n.includes("gl")) match = "category";
    else if (n.includes("department") || n.includes("costcenter") || n.includes("dept")) match = "department";
    else if (n.includes("budget")) match = "budgeted_amount";
    else if (n.includes("actual") || n.includes("spend") || n.includes("spent")) match = "actual_amount";
    else if (n.includes("period") || n.includes("quarter") || n.includes("month") || n.includes("date")) match = "period";
    else if (n.includes("vendor") || n.includes("supplier")) match = "vendor";
    else if (n.includes("note") || n.includes("comment") || n.includes("memo")) match = "notes";
    out[h] = match;
  }
  return out;
}

function ImportPage() {
  const orgId = useCurrentOrgId();
  const memberships = useMemberships();
  const isViewer = memberships.data?.find((m) => m.org_id === orgId)?.role === "viewer";
  const qc = useQueryClient();
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, Field | "">>({});
  const [busy, setBusy] = useState(false);

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "budget-pulse-template.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const parsedHeaders = res.meta.fields ?? [];
        setHeaders(parsedHeaders);
        setRows(res.data);
        setMapping(guessMap(parsedHeaders));
      },
      error: () => toast.error("Failed to parse CSV"),
    });
  }

  async function commit() {
    if (!orgId) return toast.error("No workspace selected");
    const missing = REQUIRED_FIELDS.filter((f) => !Object.values(mapping).includes(f));
    if (missing.length) return toast.error("Missing required fields: " + missing.join(", "));

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const inv: Record<Field, string> = {} as Record<Field, string>;
    for (const [csvCol, f] of Object.entries(mapping)) if (f) inv[f] = csvCol;

    const inserts = rows.map((r) => ({
      org_id: orgId,
      created_by: userData.user!.id,
      category: (r[inv.category] ?? "").trim() || "Uncategorized",
      department: (r[inv.department] ?? "").trim() || "General",
      budgeted_amount: parseFloat((r[inv.budgeted_amount] ?? "0").replace(/[^0-9.\-]/g, "")) || 0,
      actual_amount: parseFloat((r[inv.actual_amount] ?? "0").replace(/[^0-9.\-]/g, "")) || 0,
      period: (r[inv.period] ?? "").trim() || "unknown",
      vendor: inv.vendor ? (r[inv.vendor] ?? null) || null : null,
      notes: inv.notes ? (r[inv.notes] ?? null) || null : null,
    }));

    setBusy(true);
    try {
      const { error } = await supabase.from("budget_entries").insert(inserts);
      if (error) throw error;
      toast.success(`Imported ${inserts.length} rows`);
      setRows([]); setHeaders([]); setMapping({});
      qc.invalidateQueries();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally { setBusy(false); }
  }

  if (isViewer) {
    return (
      <>
        <PageHeader title="Import" description="Bring budget data into your workspace." />
        <PageBody>
          <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
            Your role is viewer, which is read-only. Ask an admin to import data or change your role.
          </div>
        </PageBody>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Import"
        description="Upload a CSV from QuickBooks, NetSuite, Salesforce, HubSpot, or a spreadsheet."
        actions={
          <Button variant="outline" onClick={downloadTemplate} className="min-h-11">
            <Download className="h-4 w-4" /> CSV template
          </Button>
        }
      />
      <PageBody>

        {rows.length === 0 ? (
          <label className="grid cursor-pointer place-items-center rounded-lg border border-dashed border-border p-14 text-center hover:bg-accent/40">
            <FileSpreadsheet className="mb-4 h-8 w-8" />
            <div className="font-semibold">Choose a CSV file to upload</div>
            <div className="mt-1 text-sm text-muted-foreground">Or download the template first and fill it in.</div>
            <input type="file" accept=".csv" className="hidden" onChange={onFile} />
            <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background">
              <Upload className="h-4 w-4" /> Select file
            </div>
          </label>
        ) : (
          <div className="space-y-6">
            <section className="rounded-lg border border-border p-4 sm:p-6">
              <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Map columns</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                We guessed based on your headers. Fix anything that looks off.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {headers.map((h) => (
                  <div key={h} className="space-y-1.5">
                    <Label className="font-mono text-xs">{h}</Label>
                    <Select value={mapping[h] || "__skip"} onValueChange={(v) => setMapping((m) => ({ ...m, [h]: v === "__skip" ? "" : (v as Field) }))}>
                      <SelectTrigger><SelectValue placeholder="Skip" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__skip">Skip this column</SelectItem>
                        {ALL_FIELDS.map((f) => (
                          <SelectItem key={f} value={f}>{FIELD_LABELS[f]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-border">
              <div className="border-b border-border p-4">
                <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Preview ({rows.length} rows)</h2>
              </div>
              <div className="max-h-96 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background">
                    <tr>{headers.map((h) => <th key={h} className="border-b border-border p-2 text-left font-mono text-xs">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 20).map((r, i) => (
                      <tr key={i} className="border-b border-border">
                        {headers.map((h) => <td key={h} className="p-2 text-muted-foreground">{r[h]}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button onClick={commit} disabled={busy} className="w-full sm:w-auto min-h-11">{busy ? "Importing…" : `Import ${rows.length} rows`}</Button>
              <Button variant="outline" onClick={() => { setRows([]); setHeaders([]); setMapping({}); }} className="w-full sm:w-auto min-h-11">Cancel</Button>
            </div>
          </div>
        )}
      </PageBody>
    </>
  );
}
