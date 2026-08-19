import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useBudgetEntries } from "@/hooks/use-budget-entries";
import { useExpenses } from "@/hooks/use-expenses";
import { useFiscalPeriods } from "@/hooks/use-fiscal-periods";
import { PageHeader, PageBody, StatCard, EmptyState } from "@/components/app/page";
import { fmtCurrency } from "@/lib/format";
import { calculateVariance, getHealthBadgeConfig } from "@/lib/variance-engine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Upload, Calendar, Receipt, TrendingUp, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/app/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: budgetEntries, isLoading: loadingEntries } = useBudgetEntries();
  const { expenses } = useExpenses();
  const { periods } = useFiscalPeriods();
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");

  const summary = useMemo(() => {
    let rows = budgetEntries ?? [];
    if (selectedPeriod !== "all") {
      rows = rows.filter((r) => r.period === selectedPeriod);
    }

    const budgeted = rows.reduce((a, r) => a + r.budgeted_amount, 0);
    const actual = rows.reduce((a, r) => a + r.actual_amount, 0);
    const varianceMetrics = calculateVariance(budgeted, actual);

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
    return { rows, budgeted, actual, metrics: varianceMetrics, byCategory, byDept, byPeriod };
  }, [budgetEntries, selectedPeriod]);

  const healthConfig = getHealthBadgeConfig(summary.metrics.health);

  return (
    <>
      <PageHeader
        title="Financial Dashboard"
        description="Real-time budget vs. actual variance engine across your organization."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="All Periods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Periods</SelectItem>
              {periods.map((p) => (
                <SelectItem key={p.id} value={p.name}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Link to="/app/expenses">
            <Button size="sm" variant="outline">
              <Receipt className="mr-1.5 h-4 w-4" />
              Log Expense
            </Button>
          </Link>
          <Link to="/app/budgets">
            <Button size="sm">
              <Calendar className="mr-1.5 h-4 w-4" />
              Manage Budgets
            </Button>
          </Link>
        </div>
      </PageHeader>

      <PageBody>
        {loadingEntries ? (
          <div className="text-sm text-muted-foreground">Loading financial telemetry…</div>
        ) : summary.rows.length === 0 ? (
          <EmptyState
            title="No budget data found"
            description="Import a CSV or record your first budget entries to populate the variance engine."
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
            {/* TOP KPI CARDS */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total Budgeted Cap"
                value={fmtCurrency(summary.budgeted)}
                sub={`${summary.rows.length} budget line items`}
              />
              <StatCard
                label="Actual Spend"
                value={fmtCurrency(summary.actual)}
                sub={`${summary.metrics.spendPercentage.toFixed(1)}% of planned budget`}
              />
              <StatCard
                label="Net Variance"
                value={fmtCurrency(summary.metrics.variance)}
                sub={summary.metrics.variance >= 0 ? "Under budget surplus" : "Over budget deficit"}
              />
              <div className="rounded-lg border border-border bg-card p-5 shadow-xs">
                <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
                  Budget Health Status
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={`${healthConfig.badgeClass} text-sm px-2.5 py-1`}>
                    <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${healthConfig.dotClass}`} />
                    {healthConfig.label}
                  </Badge>
                </div>
                <div className="text-[11px] text-muted-foreground mt-2 font-mono">
                  Remaining Cap: {fmtCurrency(summary.metrics.remainingCap)}
                </div>
              </div>
            </div>

            {/* BREAKDOWN TABLES */}
            <BreakdownTable title="By Category" map={summary.byCategory} />
            <BreakdownTable title="By Department" map={summary.byDept} />
            <BreakdownTable title="By Period" map={summary.byPeriod} />

            {/* RECENT ENTRIES TABLE */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">
                  Recent Budget Telemetry
                </h2>
                <Link to="/app/expenses" className="text-xs text-primary hover:underline">
                  View all expenses & line items →
                </Link>
              </div>
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
                      <TableHead className="w-[120px]">Health</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.rows.slice(0, 10).map((r) => {
                      const m = calculateVariance(r.budgeted_amount, r.actual_amount);
                      const hc = getHealthBadgeConfig(m.health);
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
                          <TableCell className="text-right font-mono font-semibold">
                            {fmtCurrency(m.variance)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`${hc.badgeClass} text-[10px] px-1.5 py-0.5`}>
                              {hc.label}
                            </Badge>
                          </TableCell>
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
    .map(([k, v]) => {
      const metrics = calculateVariance(v.budgeted, v.actual);
      return { key: k, ...v, ...metrics };
    })
    .sort((a, b) => b.budgeted - a.budgeted);

  return (
    <section>
      <h2 className="mb-3 text-sm font-mono uppercase tracking-widest text-muted-foreground">
        {title} Rollup Summary
      </h2>
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{title.replace("By ", "")}</TableHead>
              <TableHead className="text-right">Budgeted</TableHead>
              <TableHead className="text-right">Actual</TableHead>
              <TableHead className="text-right">Variance</TableHead>
              <TableHead className="w-[140px]">Health & Utilization</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const hc = getHealthBadgeConfig(r.health);
              return (
                <TableRow key={r.key}>
                  <TableCell className="font-medium">{r.key}</TableCell>
                  <TableCell className="text-right font-mono">{fmtCurrency(r.budgeted)}</TableCell>
                  <TableCell className="text-right font-mono">{fmtCurrency(r.actual)}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{fmtCurrency(r.variance)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span>{r.spendPercentage.toFixed(0)}%</span>
                        <Badge variant="outline" className={`${hc.badgeClass} text-[9px] px-1 py-0`}>
                          {hc.label}
                        </Badge>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full ${
                            r.health === "over_budget"
                              ? "bg-rose-500"
                              : r.health === "near_limit"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(r.spendPercentage, 100)}%` }}
                        />
                      </div>
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
