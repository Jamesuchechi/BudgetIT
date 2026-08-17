import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useBudgetEntries } from "@/hooks/use-budget-entries";
import { PageHeader, PageBody, EmptyState } from "@/components/app/page";
import { fmtCurrency } from "@/lib/format";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Legend,
} from "recharts";

export const Route = createFileRoute("/app/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { data } = useBudgetEntries();
  const rows = data ?? [];

  const trend = useMemo(() => {
    const map = new Map<string, { period: string; budgeted: number; actual: number }>();
    for (const r of rows) {
      const cur = map.get(r.period) ?? { period: r.period, budgeted: 0, actual: 0 };
      cur.budgeted += r.budgeted_amount;
      cur.actual += r.actual_amount;
      map.set(r.period, cur);
    }
    return Array.from(map.values()).sort((a, b) => a.period.localeCompare(b.period));
  }, [rows]);

  const byDept = useMemo(() => {
    const map = new Map<string, { department: string; budgeted: number; actual: number; variance: number }>();
    for (const r of rows) {
      const cur = map.get(r.department) ?? { department: r.department, budgeted: 0, actual: 0, variance: 0 };
      cur.budgeted += r.budgeted_amount;
      cur.actual += r.actual_amount;
      cur.variance = cur.budgeted - cur.actual;
      map.set(r.department, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.budgeted - a.budgeted);
  }, [rows]);

  const rankings = useMemo(() => {
    const byCat = new Map<string, { key: string; variance: number; budgeted: number; actual: number }>();
    for (const r of rows) {
      const k = `${r.category} · ${r.department}`;
      const cur = byCat.get(k) ?? { key: k, variance: 0, budgeted: 0, actual: 0 };
      cur.budgeted += r.budgeted_amount;
      cur.actual += r.actual_amount;
      cur.variance = cur.budgeted - cur.actual;
      byCat.set(k, cur);
    }
    const all = Array.from(byCat.values());
    return {
      overspend: [...all].sort((a, b) => a.variance - b.variance).slice(0, 5),
      underspend: [...all].sort((a, b) => b.variance - a.variance).slice(0, 5),
    };
  }, [rows]);

  return (
    <>
      <PageHeader title="Analytics" description="Trends, variance, and top over/underspend across your data." />
      <PageBody>
        {rows.length === 0 ? (
          <EmptyState title="Nothing to analyze yet" description="Import a CSV first." />
        ) : (
          <div className="space-y-8">
            <ChartCard title="Budget vs. Actual — trend by period">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trend} margin={{ left: 8, right: 12, top: 8, bottom: 8 }}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 4" />
                  <XAxis dataKey="period" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} stroke="var(--color-border)" />
                  <YAxis
                    tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                    stroke="var(--color-border)"
                    tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{ background: "var(--color-background)", border: "1px solid var(--color-border)", fontSize: 12 }}
                    formatter={(v) => fmtCurrency(Number(v))}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="budgeted" stroke="var(--color-muted-foreground)" strokeDasharray="4 4" dot={false} />
                  <Line type="monotone" dataKey="actual" stroke="var(--color-foreground)" strokeWidth={2} dot={{ r: 3, fill: "var(--color-foreground)" }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Variance by department">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={byDept} margin={{ left: 8, right: 12, top: 8, bottom: 8 }}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 4" />
                  <XAxis dataKey="department" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} stroke="var(--color-border)" />
                  <YAxis
                    tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                    stroke="var(--color-border)"
                    tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{ background: "var(--color-background)", border: "1px solid var(--color-border)", fontSize: 12 }}
                    formatter={(v) => fmtCurrency(Number(v))}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="budgeted" fill="var(--color-chart-4)" />
                  <Bar dataKey="actual" fill="var(--color-foreground)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="grid gap-6 lg:grid-cols-2">
              <RankList title="Top overspend" rows={rankings.overspend} />
              <RankList title="Top underspend" rows={rankings.underspend} />
            </div>
          </div>
        )}
      </PageBody>
    </>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border p-4 sm:p-6">
      <h2 className="mb-4 text-sm font-mono uppercase tracking-widest text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}

function RankList({ title, rows }: { title: string; rows: { key: string; variance: number; budgeted: number; actual: number }[] }) {
  return (
    <section className="rounded-lg border border-border p-4 sm:p-6">
      <h2 className="mb-4 text-sm font-mono uppercase tracking-widest text-muted-foreground">{title}</h2>
      <ul className="divide-y divide-border">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center justify-between py-3">
            <div className="min-w-0 pr-4">
              <div className="truncate text-sm font-medium">{r.key}</div>
              <div className="text-xs text-muted-foreground">
                Budget {fmtCurrency(r.budgeted)} · Actual {fmtCurrency(r.actual)}
              </div>
            </div>
            <div className="shrink-0 font-mono text-sm">{fmtCurrency(r.variance)}</div>
          </li>
        ))}
        {rows.length === 0 && <li className="py-3 text-sm text-muted-foreground">No data.</li>}
      </ul>
    </section>
  );
}
