import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageBody, EmptyState } from "@/components/app/page";
import { useBudgetEntries } from "@/hooks/use-budget-entries";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { fmtCurrency } from "@/lib/format";
import { toCSV } from "@/lib/csv";
import { useMemo } from "react";

export const Route = createFileRoute("/app/export")({
  component: ExportPage,
});

function download(name: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function ExportPage() {
  const { data } = useBudgetEntries();
  const rows = data ?? [];

  const rollups = useMemo(() => {
    const cat = new Map<string, { key: string; budgeted: number; actual: number }>();
    const dept = new Map<string, { key: string; budgeted: number; actual: number }>();
    const period = new Map<string, { key: string; budgeted: number; actual: number }>();
    for (const r of rows) {
      for (const [map, key] of [
        [cat, r.category],
        [dept, r.department],
        [period, r.period],
      ] as const) {
        const cur = map.get(key) ?? { key, budgeted: 0, actual: 0 };
        cur.budgeted += r.budgeted_amount;
        cur.actual += r.actual_amount;
        map.set(key, cur);
      }
    }
    return { cat, dept, period };
  }, [rows]);

  function exportRaw() {
    const headers = [
      "Category",
      "Department",
      "Budgeted Amount",
      "Actual Spend",
      "Period",
      "Vendor",
      "Notes",
    ];
    const mapped = rows.map((r) => ({
      Category: r.category,
      Department: r.department,
      "Budgeted Amount": r.budgeted_amount,
      "Actual Spend": r.actual_amount,
      Period: r.period,
      Vendor: r.vendor ?? "",
      Notes: r.notes ?? "",
    }));
    download("budget-entries.csv", toCSV(mapped, headers));
  }

  function exportRollup(kind: "category" | "department" | "period") {
    const map =
      kind === "category" ? rollups.cat : kind === "department" ? rollups.dept : rollups.period;
    const label = kind[0].toUpperCase() + kind.slice(1);
    const headers = [label, "Budgeted", "Actual", "Variance", "Utilization %"];
    const list = Array.from(map.values()).map((r) => ({
      [label]: r.key,
      Budgeted: r.budgeted,
      Actual: r.actual,
      Variance: r.budgeted - r.actual,
      "Utilization %": r.budgeted > 0 ? ((r.actual / r.budgeted) * 100).toFixed(2) : "0",
    }));
    download(`rollup-by-${kind}.csv`, toCSV(list, headers));
  }

  return (
    <>
      <PageHeader title="Export" description="Download raw entries or pre-rolled summaries." />
      <PageBody>
        {rows.length === 0 ? (
          <EmptyState title="Nothing to export" description="Import data first." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ExportCard
              title="Raw entries"
              desc={`${rows.length} rows, all fields`}
              action={exportRaw}
            />
            <ExportCard
              title="Roll up by category"
              desc={`${rollups.cat.size} categories · total ${fmtCurrency(rows.reduce((a, r) => a + r.budgeted_amount, 0))}`}
              action={() => exportRollup("category")}
            />
            <ExportCard
              title="Roll up by department"
              desc={`${rollups.dept.size} departments`}
              action={() => exportRollup("department")}
            />
            <ExportCard
              title="Roll up by period"
              desc={`${rollups.period.size} periods`}
              action={() => exportRollup("period")}
            />
          </div>
        )}
      </PageBody>
    </>
  );
}

function ExportCard({ title, desc, action }: { title: string; desc: string; action: () => void }) {
  return (
    <div className="rounded-lg border border-border p-5">
      <div className="font-semibold">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
      <Button variant="outline" className="mt-4 w-full" onClick={action}>
        <Download className="h-4 w-4" /> Download CSV
      </Button>
    </div>
  );
}
