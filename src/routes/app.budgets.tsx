import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, PageBody } from "@/components/app/page";
import { useFiscalPeriods, PeriodStatus, PeriodType } from "@/hooks/use-fiscal-periods";
import { useCategoriesAndDepartments } from "@/hooks/use-categories-departments";
import { useBudgetEntries } from "@/hooks/use-budget-entries";
import { useExpenses } from "@/hooks/use-expenses";
import { fmtCurrency } from "@/lib/format";
import {
  calculateVariance,
  getHealthBadgeConfig,
  calculateBudgetRollover,
} from "@/lib/variance-engine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Layers,
  Building2,
  Plus,
  ArrowRightLeft,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  FolderTree,
  Tag,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/budgets")({
  component: BudgetsPage,
});

function BudgetsPage() {
  const { periods, isLoading: loadingPeriods, createPeriod, updateStatus, executeRollover } = useFiscalPeriods();
  const { categories, departments, addCategory, addDepartment, toggleArchiveDepartment } = useCategoriesAndDepartments();
  const { data: budgetEntries } = useBudgetEntries();
  const { expenses } = useExpenses();

  const [createPeriodOpen, setCreatePeriodOpen] = useState(false);
  const [createCatOpen, setCreateCatOpen] = useState(false);
  const [createDeptOpen, setCreateDeptOpen] = useState(false);
  const [rolloverOpen, setRolloverOpen] = useState(false);

  // Form states
  const [periodName, setPeriodName] = useState("");
  const [periodType, setPeriodType] = useState<PeriodType>("quarterly");
  const [startDate, setStartDate] = useState("2026-04-01");
  const [endDate, setEndDate] = useState("2026-06-30");

  const [catName, setCatName] = useState("");
  const [catParentId, setCatParentId] = useState<string>("none");
  const [catColor, setCatColor] = useState("#3b82f6");
  const [catCap, setCatCap] = useState("50000");

  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [deptCap, setDeptCap] = useState("100000");

  const [rolloverSource, setRolloverSource] = useState("2026-Q1");
  const [rolloverTargetId, setRolloverTargetId] = useState("");

  const activePeriods = periods.filter((p) => p.status === "active");

  async function handleCreatePeriod() {
    if (!periodName.trim()) return toast.error("Please enter a period name");
    await createPeriod({
      name: periodName.trim(),
      type: periodType,
      start_date: startDate,
      end_date: endDate,
    });
    setCreatePeriodOpen(false);
    setPeriodName("");
  }

  async function handleCreateCategory() {
    if (!catName.trim()) return toast.error("Please enter a category name");
    await addCategory({
      name: catName.trim(),
      parent_id: catParentId === "none" ? null : catParentId,
      color: catColor,
      budget_cap: parseFloat(catCap) || 0,
    });
    setCreateCatOpen(false);
    setCatName("");
  }

  async function handleCreateDepartment() {
    if (!deptName.trim()) return toast.error("Please enter a department name");
    await addDepartment({
      name: deptName.trim(),
      code: deptCode.trim() || deptName.substring(0, 3).toUpperCase(),
      budget_cap: parseFloat(deptCap) || 0,
    });
    setCreateDeptOpen(false);
    setDeptName("");
    setDeptCode("");
  }

  async function handleExecuteRollover() {
    if (!rolloverTargetId) return toast.error("Select a target period for rollover");
    const sourceEntries = (budgetEntries ?? []).filter((e) => e.period === rolloverSource);
    const budgeted = sourceEntries.reduce((a, b) => a + b.budgeted_amount, 0) || 100000;
    const actual = sourceEntries.reduce((a, b) => a + b.actual_amount, 0) || 78000;

    await executeRollover({
      sourcePeriodName: rolloverSource,
      targetPeriodId: rolloverTargetId,
      budgeted,
      actual,
    });
    setRolloverOpen(false);
  }

  const parentCategories = categories.filter((c) => !c.parent_id);

  return (
    <>
      <PageHeader
        title="Core Budgeting & Fiscal Periods"
        description="Manage fiscal calendars, multi-period budgets, category caps, and automated rollovers."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setRolloverOpen(true)}>
            <ArrowRightLeft className="mr-1.5 h-4 w-4" />
            Budget Rollover
          </Button>
          <Button size="sm" onClick={() => setCreatePeriodOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            New Fiscal Period
          </Button>
        </div>
      </PageHeader>

      <PageBody>
        <Tabs defaultValue="periods" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="periods" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fiscal Periods
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <FolderTree className="h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="departments" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Departments
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: FISCAL PERIODS */}
          <TabsContent value="periods" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">Fiscal Periods & Status Management</h3>
                <p className="text-xs text-muted-foreground">
                  Control budget availability per quarter or year with active status locks.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {periods.map((p) => {
                const isCurrent = p.status === "active";
                return (
                  <Card key={p.id} className="relative overflow-hidden border border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="font-mono text-xs uppercase">
                          {p.type}
                        </Badge>
                        <PeriodStatusBadge status={p.status} />
                      </div>
                      <CardTitle className="text-lg font-bold">{p.name}</CardTitle>
                      <CardDescription className="text-xs font-mono">
                        {p.start_date} → {p.end_date}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-xs">
                      {p.carried_over_amount !== 0 && (
                        <div className="flex items-center justify-between rounded-md bg-muted/50 p-2 font-mono">
                          <span className="text-muted-foreground">Rollover Balance:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            +{fmtCurrency(p.carried_over_amount)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <span className="text-muted-foreground">Status Control:</span>
                        <Select
                          value={p.status}
                          onValueChange={(val) => updateStatus({ id: p.id, status: val as PeriodStatus })}
                        >
                          <SelectTrigger className="h-7 w-[110px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                            <SelectItem value="locked">Locked</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* TAB 2: CATEGORY HIERARCHY */}
          <TabsContent value="categories" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">Two-Tier Category Hierarchy & Budget Caps</h3>
                <p className="text-xs text-muted-foreground">
                  Group expenses under parent categories and sub-accounts with custom color badges.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setCreateCatOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" /> Add Category
              </Button>
            </div>

            <div className="space-y-4">
              {parentCategories.map((parent) => {
                const subCats = categories.filter((c) => c.parent_id === parent.id);
                return (
                  <Card key={parent.id} className="border border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3.5 w-3.5 rounded-full"
                            style={{ backgroundColor: parent.color || "#3b82f6" }}
                          />
                          <CardTitle className="text-base">{parent.name}</CardTitle>
                          <Badge variant="secondary" className="text-[10px]">
                            Parent Category
                          </Badge>
                        </div>
                        <span className="font-mono text-sm font-semibold">
                          Cap: {fmtCurrency(parent.budget_cap)}
                        </span>
                      </div>
                    </CardHeader>
                    {subCats.length > 0 && (
                      <CardContent className="space-y-2 pt-0">
                        <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                          Sub-categories:
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {subCats.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 p-2.5 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="font-medium">{sub.name}</span>
                              </div>
                              <span className="font-mono text-muted-foreground">
                                {fmtCurrency(sub.budget_cap)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* TAB 3: DEPARTMENTS */}
          <TabsContent value="departments" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">Cost-Center & Department Management</h3>
                <p className="text-xs text-muted-foreground">
                  Track allocated budget caps and spend utilization across organizational departments.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setCreateDeptOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" /> Add Department
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {departments.map((dept) => {
                const deptExpenses = expenses.filter((e) => e.department === dept.name);
                const actualSpent = deptExpenses.reduce((a, b) => a + b.amount, 0);
                const cap = dept.budget_cap || 100000;
                const { spendPercentage, health } = calculateVariance(cap, actualSpent);
                const healthConfig = getHealthBadgeConfig(health);

                return (
                  <Card
                    key={dept.id}
                    className={`border border-border ${dept.is_archived ? "opacity-60" : ""}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs font-bold">
                            {dept.code || "DEPT"}
                          </Badge>
                          <CardTitle className="text-base">{dept.name}</CardTitle>
                        </div>
                        <Badge variant="outline" className={healthConfig.badgeClass}>
                          {healthConfig.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs">
                      <div className="flex justify-between font-mono">
                        <span className="text-muted-foreground">Actual Spent / Cap:</span>
                        <span className="font-semibold">
                          {fmtCurrency(actualSpent)} / {fmtCurrency(cap)}
                        </span>
                      </div>
                      <Progress value={Math.min(spendPercentage, 100)} className="h-2" />
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                        <span>{spendPercentage.toFixed(1)}% utilized</span>
                        <button
                          onClick={() =>
                            toggleArchiveDepartment({ id: dept.id, is_archived: !dept.is_archived })
                          }
                          className="hover:underline text-xs"
                        >
                          {dept.is_archived ? "Unarchive" : "Archive"}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </PageBody>

      {/* CREATE PERIOD MODAL */}
      <Dialog open={createPeriodOpen} onOpenChange={setCreatePeriodOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Fiscal Period</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Period Identifier / Name</Label>
              <Input
                placeholder="e.g. 2026-Q2 or FY2027"
                value={periodName}
                onChange={(e) => setPeriodName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={periodType} onValueChange={(v) => setPeriodType(v as PeriodType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreatePeriodOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePeriod}>Save Period</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CREATE CATEGORY MODAL */}
      <Dialog open={createCatOpen} onOpenChange={setCreateCatOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category / Sub-Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Category Name</Label>
              <Input
                placeholder="e.g. Cloud Infrastructure"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
              />
            </div>
            <div>
              <Label>Parent Category (Optional)</Label>
              <Select value={catParentId} onValueChange={setCatParentId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Top-Level Parent)</SelectItem>
                  {parentCategories.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Badge Color</Label>
                <Input type="color" value={catColor} onChange={(e) => setCatColor(e.target.value)} />
              </div>
              <div>
                <Label>Budget Cap ($)</Label>
                <Input type="number" value={catCap} onChange={(e) => setCatCap(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateCatOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCategory}>Save Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CREATE DEPARTMENT MODAL */}
      <Dialog open={createDeptOpen} onOpenChange={setCreateDeptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Department / Cost Center</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Department Name</Label>
              <Input
                placeholder="e.g. Product Engineering"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cost Center Code</Label>
                <Input
                  placeholder="ENG"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                />
              </div>
              <div>
                <Label>Budget Cap ($)</Label>
                <Input type="number" value={deptCap} onChange={(e) => setDeptCap(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDeptOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDepartment}>Save Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ROLLOVER MODAL */}
      <Dialog open={rolloverOpen} onOpenChange={setRolloverOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Execute Budget Rollover</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <p className="text-muted-foreground">
              Calculate unspent budget surplus or deficit from a previous period and transfer it forward into an upcoming active period.
            </p>
            <div>
              <Label>Source Fiscal Period</Label>
              <Input value={rolloverSource} onChange={(e) => setRolloverSource(e.target.value)} />
            </div>
            <div>
              <Label>Target Destination Period</Label>
              <Select value={rolloverTargetId} onValueChange={setRolloverTargetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target period" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRolloverOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExecuteRollover}>Execute Rollover</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PeriodStatusBadge({ status }: { status: PeriodStatus }) {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> Active
        </Badge>
      );
    case "draft":
      return (
        <Badge variant="outline" className="text-amber-600 border-amber-500/20 flex items-center gap-1">
          <Clock className="h-3 w-3" /> Draft
        </Badge>
      );
    case "closed":
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Unlock className="h-3 w-3" /> Closed
        </Badge>
      );
    case "locked":
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <Lock className="h-3 w-3" /> Locked
        </Badge>
      );
  }
}
