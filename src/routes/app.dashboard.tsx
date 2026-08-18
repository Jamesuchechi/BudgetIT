import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useBudgetEntries } from "@/hooks/use-budget-entries";
import { PageHeader, PageBody, StatCard, EmptyState } from "@/components/app/page";
import { fmtCurrency, fmtPercent } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/app/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data, isLoading } = useBudgetEntries();

  const summary = useMemo(() => {
    const rows = data ?? [];
    const budgeted = rows.reduce((a, r) => a + r.budgeted_amount, 0);
    const actual = rows.reduce((a, r) => a + r.actual_amount, 0);
    const variance = budgeted - actual;
    const utilization = budgeted > 0 ? actual / budgeted : 0;

    const byCategory = new Map<string, { budgeted: number; actual: number }>();
    const byDept = new Map<string, { budgeted: number; actual: number }>();
    const byPeriod = new Map<string, { budgeted: number; actual: number }>();
    for (const r of rows) {
      for (const [map, key] of [
        [byCategory, r.category],
        [byDept, r.department],
        [byPeriod, r.period],
      ] as const) {
        const cur = map.get(key) ?? { budgeted: 0, actual: 0 };
        cur.budgeted += r.budgeted_amount;
        cur.actual += r.actual_amount;
        map.set(key, cur);
      }
    }
    return { rows, budgeted, actual, variance, utilization, byCategory, byDept, byPeriod };
  }, [data]);

  return (
    <>
      <PageHeader title="Dashboard" description="Budget vs. actual across your organization." />
      <PageBody>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : summary.rows.length === 0 ? (
          <EmptyState
            title="No budget data yet"
            description="Import a CSV from your finance or CRM tool to see this page come alive."
            action={
              <Link
                to="/app/import"
                className="inline-flex rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
              >
                Go to Import
              </Link>
            }
          />
        ) : (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total Budgeted"
                value={fmtCurrency(summary.budgeted)}
                sub={`${summary.rows.length} line items`}
              />
              <StatCard
                label="Total Spent"
                value={fmtCurrency(summary.actual)}
                sub={`${(summary.utilization * 100).toFixed(1)}% of plan`}
              />
              <StatCard
                label="Variance"
                value={fmtCurrency(summary.variance)}
                sub={summary.variance >= 0 ? "under budget" : "over budget"}
              />
              <StatCard
                label="Utilization"
                value={`${(summary.utilization * 100).toFixed(1)}%`}
                sub={fmtPercent(summary.utilization - 1) + " vs. plan"}
              />
            </div>

            <BreakdownTable title="By Category" map={summary.byCategory} />
            <BreakdownTable title="By Department" map={summary.byDept} />
            <BreakdownTable title="By Period" map={summary.byPeriod} />

            <section>
              <h2 className="mb-3 text-sm font-mono uppercase tracking-widest text-muted-foreground">
                Recent entries
              </h2>
              <div className="overflow-x-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Budgeted</TableHead>
                      <TableHead className="text-right">Actual</TableHead>
                      <TableHead className="text-right">Variance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.rows.slice(0, 12).map((r) => {
                      const v = r.budgeted_amount - r.actual_amount;
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.category}</TableCell>
                          <TableCell className="text-muted-foreground">{r.department}</TableCell>
                          <TableCell className="font-mono text-xs">{r.period}</TableCell>
                          <TableCell className="text-right font-mono">
                            {fmtCurrency(r.budgeted_amount)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {fmtCurrency(r.actual_amount)}
                          </TableCell>
                          <TableCell className="text-right font-mono">{fmtCurrency(v)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </section>
          </div>
        )}
      </PageBody>
    </>
  );
}

function BreakdownTable({
  title,
  map,
}: {
  title: string;
  map: Map<string, { budgeted: number; actual: number }>;
}) {
  const rows = Array.from(map.entries())
    .map(([k, v]) => ({ key: k, ...v, variance: v.budgeted - v.actual }))
    .sort((a, b) => b.budgeted - a.budgeted);
  return (
    <section>
      <h2 className="mb-3 text-sm font-mono uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{title.replace("By ", "")}</TableHead>
              <TableHead className="text-right">Budgeted</TableHead>
              <TableHead className="text-right">Actual</TableHead>
              <TableHead className="text-right">Variance</TableHead>
              <TableHead className="w-[120px]">Utilization</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const util = r.budgeted > 0 ? r.actual / r.budgeted : 0;
              return (
                <TableRow key={r.key}>
                  <TableCell className="font-medium">{r.key}</TableCell>
                  <TableCell className="text-right font-mono">{fmtCurrency(r.budgeted)}</TableCell>
                  <TableCell className="text-right font-mono">{fmtCurrency(r.actual)}</TableCell>
                  <TableCell className="text-right font-mono">{fmtCurrency(r.variance)}</TableCell>
                  <TableCell>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-foreground"
                        style={{ width: `${Math.min(util * 100, 100)}%` }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
