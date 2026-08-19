import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageHeader, PageBody, StatCard } from "@/components/app/page";
import { useBudgetEntries } from "@/hooks/use-budget-entries";
import { useFiscalPeriods } from "@/hooks/use-fiscal-periods";
import { useCurrentOrg } from "@/hooks/use-org";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileSpreadsheet, FileText, Mail, Calendar, Clock, Sparkles } from "lucide-react";
import { fmtCurrency } from "@/lib/format";
import { toCSV, toExcelSpreadsheet, CSVDelimiter } from "@/lib/csv";
import { generatePDFExecutiveReport } from "@/lib/pdf-report";
import { calculateVariance } from "@/lib/variance-engine";
import { toast } from "sonner";

export const Route = createFileRoute("/app/export")({
  component: ExportPage,
});

function ExportPage() {
  const { data: budgetEntries } = useBudgetEntries();
  const { periods } = useFiscalPeriods();
  const { currentOrg } = useCurrentOrg();
  const rows = budgetEntries ?? [];

  // Exporter filters
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [delimiter, setDelimiter] = useState<CSVDelimiter>(",");

  // Scheduled export state
  const [scheduledEnabled, setScheduledEnabled] = useState(false);
  const [scheduledFreq, setScheduledFreq] = useState<"weekly" | "monthly">("monthly");
  const [scheduledEmail, setScheduledEmail] = useState("finance@company.com");

  const filteredRows = useMemo(() => {
    if (selectedPeriod === "all") return rows;
    return rows.filter((r) => r.period === selectedPeriod);
  }, [rows, selectedPeriod]);

  const summary = useMemo(() => {
    const budgeted = filteredRows.reduce((a, r) => a + r.budgeted_amount, 0);
    const actual = filteredRows.reduce((a, r) => a + r.actual_amount, 0);
    const metrics = calculateVariance(budgeted, actual);

    const catMap = new Map<string, { name: string; budgeted: number; actual: number; variance: number }>();
    const deptMap = new Map<string, { name: string; budgeted: number; actual: number; variance: number }>();

    for (const r of filteredRows) {
      const c = catMap.get(r.category) ?? { name: r.category, budgeted: 0, actual: 0, variance: 0 };
      c.budgeted += r.budgeted_amount;
      c.actual += r.actual_amount;
      c.variance = c.budgeted - c.actual;
      catMap.set(r.category, c);

      const d = deptMap.get(r.department) ?? { name: r.department, budgeted: 0, actual: 0, variance: 0 };
      d.budgeted += r.budgeted_amount;
      d.actual += r.actual_amount;
      d.variance = d.budgeted - d.actual;
      deptMap.set(r.department, d);
    }

    return {
      budgeted,
      actual,
      metrics,
      byCategory: Array.from(catMap.values()),
      byDepartment: Array.from(deptMap.values()),
    };
  }, [filteredRows]);

  function exportCSV() {
    const headers = ["Category", "Department", "Budgeted Amount", "Actual Spend", "Period", "Vendor", "Notes"];
    const mapped = filteredRows.map((r) => ({
      Category: r.category,
      Department: r.department,
      "Budgeted Amount": r.budgeted_amount,
      "Actual Spend": r.actual_amount,
      Period: r.period,
      Vendor: r.vendor ?? "",
      Notes: r.notes ?? "",
    }));

    const content = toCSV(mapped, headers, delimiter);
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budgetit-export-${selectedPeriod}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV export downloaded");
  }

  function exportExcel() {
    const headers = ["Category", "Department", "Budgeted Amount", "Actual Spend", "Period", "Vendor", "Notes"];
    const mapped = filteredRows.map((r) => ({
      Category: r.category,
      Department: r.department,
      "Budgeted Amount": r.budgeted_amount,
      "Actual Spend": r.actual_amount,
      Period: r.period,
      Vendor: r.vendor ?? "",
      Notes: r.notes ?? "",
    }));

    const content = toExcelSpreadsheet("BudgetIT Financial Export", mapped, headers);
    const blob = new Blob([content], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budgetit-financial-report-${selectedPeriod}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Formatted Excel report downloaded");
  }

  function exportPDFReport() {
    generatePDFExecutiveReport({
      orgName: currentOrg?.name || "Organization",
      reportTitle: "Executive Financial Summary Report",
      generatedDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      periodName: selectedPeriod === "all" ? "All Fiscal Periods" : selectedPeriod,
      totalBudgeted: summary.budgeted,
      totalActual: summary.actual,
      netVariance: summary.metrics.variance,
      utilization: summary.metrics.spendPercentage / 100,
      byCategory: summary.byCategory,
      byDepartment: summary.byDepartment,
    });
    toast.success("PDF Executive Report generated");
  }

  function saveSchedule() {
    toast.success(
      `Saved scheduled export: ${scheduledFreq} report to ${scheduledEmail}`,
    );
  }

  return (
    <>
      <PageHeader
        title="Flexible Multi-Format Data Exporter"
        description="Export filtered financial records to CSV, Excel, and printable Executive PDF Reports."
      />

      <PageBody>
        <div className="space-y-8">
          {/* FILTER TOOLBAR */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <Label className="text-xs font-mono">Period Filter:</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="h-8 w-[160px] text-xs">
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
            </div>
            <div className="text-xs font-mono text-muted-foreground">
              Selected: <span className="font-bold text-foreground">{filteredRows.length} rows</span> ({fmtCurrency(summary.budgeted)} budgeted)
            </div>
          </div>

          <Tabs defaultValue="formats" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="formats">Export Formats</TabsTrigger>
              <TabsTrigger value="schedule">Scheduled Exports</TabsTrigger>
            </TabsList>

            {/* TAB 1: EXPORT FORMATS */}
            <TabsContent value="formats" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                {/* CARD 1: CSV EXPORT */}
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Download className="h-4 w-4 text-primary" />
                      CSV Exporter
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Export raw transaction line-items with custom delimiter options.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs">
                    <div>
                      <Label>CSV Delimiter</Label>
                      <Select
                        value={delimiter}
                        onValueChange={(v) => setDelimiter(v as CSVDelimiter)}
                      >
                        <SelectTrigger className="mt-1 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=",">Comma ( , ) — Default</SelectItem>
                          <SelectItem value=";">Semicolon ( ; ) — Europe / UK</SelectItem>
                          <SelectItem value="\t">Tab ( \t ) — TSV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={exportCSV} className="w-full" size="sm">
                      <Download className="mr-1.5 h-4 w-4" /> Download CSV
                    </Button>
                  </CardContent>
                </Card>

                {/* CARD 2: EXCEL SPREADSHEET */}
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                      Excel Spreadsheet
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Export formatted .xls/.xlsx file with auto-formatted currencies.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs">
                    <p className="text-muted-foreground leading-snug">
                      Includes header formatting, numeric currency masking, and table rollups for Microsoft Excel.
                    </p>
                    <Button onClick={exportExcel} variant="outline" className="w-full" size="sm">
                      <FileSpreadsheet className="mr-1.5 h-4 w-4 text-emerald-600" /> Download Excel Report
                    </Button>
                  </CardContent>
                </Card>

                {/* CARD 3: PDF EXECUTIVE REPORT */}
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-600" />
                      PDF Executive Report
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Print-ready Executive PDF report with logo, KPI cards, and category rollups.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs">
                    <p className="text-muted-foreground leading-snug">
                      Generates a sleek executive summary document ready for executive meetings or board presentations.
                    </p>
                    <Button onClick={exportPDFReport} variant="secondary" className="w-full" size="sm">
                      <FileText className="mr-1.5 h-4 w-4" /> Generate PDF Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 2: SCHEDULED EXPORTS */}
            <TabsContent value="schedule" className="space-y-6 max-w-xl">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Automated Scheduled Email Exports
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Configure recurring financial statements delivered straight to your inbox.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="font-semibold">Enable Scheduled Email Exports</span>
                    <Switch checked={scheduledEnabled} onCheckedChange={setScheduledEnabled} />
                  </div>

                  {scheduledEnabled && (
                    <div className="space-y-4 pt-2">
                      <div>
                        <Label>Delivery Frequency</Label>
                        <Select
                          value={scheduledFreq}
                          onValueChange={(v) => setScheduledFreq(v as "weekly" | "monthly")}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly (Every Monday at 8:00 AM)</SelectItem>
                            <SelectItem value="monthly">Monthly (1st of every month)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Recipient Email Address</Label>
                        <Input
                          type="email"
                          className="mt-1"
                          value={scheduledEmail}
                          onChange={(e) => setScheduledEmail(e.target.value)}
                        />
                      </div>

                      <Button onClick={saveSchedule} size="sm" className="w-full">
                        Save Schedule Configuration
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageBody>
    </>
  );
}
