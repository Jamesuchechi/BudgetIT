import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageHeader, PageBody, StatCard } from "@/components/app/page";
import { useExpenses, ExpenseStatus, PaymentMethod, RecurringFrequency } from "@/hooks/use-expenses";
import { useCategoriesAndDepartments } from "@/hooks/use-categories-departments";
import { useFiscalPeriods } from "@/hooks/use-fiscal-periods";
import { fmtCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Plus,
  Search,
  Filter,
  CreditCard,
  Building,
  Receipt,
  CheckCircle,
  Clock,
  XCircle,
  RotateCw,
  Paperclip,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/expenses")({
  component: ExpensesPage,
});

function ExpensesPage() {
  const { expenses, isLoading, addExpense, updateStatus, deleteExpense } = useExpenses();
  const { categories, departments } = useCategoriesAndDepartments();
  const { periods } = useFiscalPeriods();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterPeriod, setFilterPeriod] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDept, setFilterDept] = useState<string>("all");

  // Form input state
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [isCredit, setIsCredit] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [periodName, setPeriodName] = useState("2026-Q1");
  const [department, setDepartment] = useState("Engineering");
  const [category, setCategory] = useState("Cloud Infrastructure");
  const [vendor, setVendor] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit_card");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<ExpenseStatus>("approved");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFreq, setRecurringFreq] = useState<RecurringFrequency>("monthly");
  const [receiptUrl, setReceiptUrl] = useState("");

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.vendor && item.vendor.toLowerCase().includes(search.toLowerCase())) ||
        item.category.toLowerCase().includes(search.toLowerCase());
      const matchPeriod = filterPeriod === "all" || item.period_name === filterPeriod;
      const matchStatus = filterStatus === "all" || item.status === filterStatus;
      const matchDept = filterDept === "all" || item.department === filterDept;
      return matchSearch && matchPeriod && matchStatus && matchDept;
    });
  }, [expenses, search, filterPeriod, filterStatus, filterDept]);

  const stats = useMemo(() => {
    const total = expenses.reduce((a, b) => a + b.amount, 0);
    const approved = expenses
      .filter((e) => e.status === "approved" || e.status === "paid")
      .reduce((a, b) => a + b.amount, 0);
    const pendingCount = expenses.filter((e) => e.status === "pending_approval").length;
    const refunds = expenses.filter((e) => e.amount < 0).reduce((a, b) => a + b.amount, 0);
    return { total, approved, pendingCount, refunds };
  }, [expenses]);

  async function handleAddExpense() {
    if (!title.trim()) return toast.error("Please enter expense title");
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount === 0) return toast.error("Please enter a valid amount");

    const finalAmount = isCredit ? -Math.abs(numAmount) : Math.abs(numAmount);

    await addExpense({
      title: title.trim(),
      amount: finalAmount,
      date,
      period_name: periodName,
      department,
      category,
      vendor: vendor.trim() || undefined,
      payment_method: paymentMethod,
      receipt_url: receiptUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      status,
      is_recurring: isRecurring,
      recurring_frequency: isRecurring ? recurringFreq : undefined,
    });

    setAddModalOpen(false);
    resetForm();
  }

  function resetForm() {
    setTitle("");
    setAmount("");
    setIsCredit(false);
    setVendor("");
    setNotes("");
    setReceiptUrl("");
    setIsRecurring(false);
  }

  return (
    <>
      <PageHeader
        title="Expense & Line-Item Tracking"
        description="Log individual expense items, manage approvals, attach receipts, and track recurring bills."
      >
        <Button size="sm" onClick={() => setAddModalOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Log Expense
        </Button>
      </PageHeader>

      <PageBody>
        <div className="space-y-6">
          {/* KPI STAT CARDS */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Line Items Spend"
              value={fmtCurrency(stats.total)}
              sub={`${expenses.length} recorded items`}
            />
            <StatCard
              label="Approved / Paid Spend"
              value={fmtCurrency(stats.approved)}
              sub="Cleared expenses"
            />
            <StatCard
              label="Pending Approvals"
              value={stats.pendingCount.toString()}
              sub="Requires manager review"
            />
            <StatCard
              label="Rebates & Refunds"
              value={fmtCurrency(stats.refunds)}
              sub="Negative line item adjustments"
            />
          </div>

          {/* FILTERS TOOLBAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 shadow-xs">
            <div className="flex flex-1 items-center gap-2 min-w-[200px]">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="Filter by title, vendor, or category…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 text-xs border-none shadow-none focus-visible:ring-0"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue placeholder="Period" />
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

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterDept} onValueChange={setFilterDept}>
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* EXPENSES TABLE */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title & Vendor</TableHead>
                  <TableHead>Department / Category</TableHead>
                  <TableHead>Period & Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                      Loading expense items…
                    </TableCell>
                  </TableRow>
                ) : filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                      No expense entries matching the current filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium text-xs flex items-center gap-1.5">
                              {item.title}
                              {item.is_recurring && (
                                <Badge variant="secondary" className="text-[9px] px-1 py-0 font-mono">
                                  <RotateCw className="h-2.5 w-2.5 mr-0.5" />
                                  {item.recurring_frequency}
                                </Badge>
                              )}
                              {item.receipt_url && (
                                <a
                                  href={item.receipt_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="View Receipt"
                                  className="text-primary hover:underline"
                                >
                                  <Paperclip className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground">{item.vendor || "Direct"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium">{item.department}</div>
                        <div className="text-[11px] text-muted-foreground">{item.category}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-xs">{item.period_name}</div>
                        <div className="text-[11px] text-muted-foreground">{item.date}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-[10px] uppercase">
                          {item.payment_method.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ExpenseStatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold">
                        <span className={item.amount < 0 ? "text-emerald-600 dark:text-emerald-400" : ""}>
                          {fmtCurrency(item.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {item.status === "pending_approval" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10 text-[10px]"
                              onClick={() => updateStatus({ id: item.id, status: "approved" })}
                            >
                              Approve
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteExpense(item.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </PageBody>

      {/* ADD EXPENSE MODAL */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Log New Expense Line Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div>
              <Label>Description / Title *</Label>
              <Input
                placeholder="e.g. AWS Cloud Infrastructure or Office Supplies"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount ($) *</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="flex flex-col justify-end">
                <div className="flex items-center space-x-2 rounded-md border border-border p-2">
                  <Switch id="credit-toggle" checked={isCredit} onCheckedChange={setIsCredit} />
                  <Label htmlFor="credit-toggle" className="text-xs cursor-pointer">
                    Refund / Credit (-)
                  </Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fiscal Period</Label>
                <Select value={periodName} onValueChange={setPeriodName}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((p) => (
                      <SelectItem key={p.id} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Transaction Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Vendor</Label>
                <Input placeholder="Vendor name" value={vendor} onChange={(e) => setVendor(e.target.value)} />
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="wire_transfer">Wire Transfer</SelectItem>
                    <SelectItem value="direct_debit">Direct Debit</SelectItem>
                    <SelectItem value="petty_cash">Petty Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border pt-3">
              <div>
                <Label>Status Workflow</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ExpenseStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col justify-end">
                <div className="flex items-center space-x-2">
                  <Switch id="recurring-toggle" checked={isRecurring} onCheckedChange={setIsRecurring} />
                  <Label htmlFor="recurring-toggle">Recurring Expense Template</Label>
                </div>
              </div>
            </div>

            {isRecurring && (
              <div>
                <Label>Recurring Frequency</Label>
                <Select
                  value={recurringFreq}
                  onValueChange={(v) => setRecurringFreq(v as RecurringFrequency)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Receipt Image / Document URL (Optional)</Label>
              <Input
                placeholder="https://..."
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddExpense}>Log Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ExpenseStatusBadge({ status }: { status: ExpenseStatus }) {
  switch (status) {
    case "paid":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
          Paid
        </Badge>
      );
    case "approved":
      return (
        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">
          Approved
        </Badge>
      );
    case "pending_approval":
      return (
        <Badge variant="outline" className="text-amber-600 border-amber-500/20 text-[10px]">
          Pending Approval
        </Badge>
      );
    case "planned":
      return (
        <Badge variant="secondary" className="text-[10px]">
          Planned
        </Badge>
      );
  }
}
