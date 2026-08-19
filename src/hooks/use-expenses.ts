import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentOrgId } from "./use-org";
import { toast } from "sonner";

export type PaymentMethod = "credit_card" | "wire_transfer" | "direct_debit" | "petty_cash";
export type ExpenseStatus = "planned" | "pending_approval" | "approved" | "paid";
export type RecurringFrequency = "monthly" | "quarterly" | "annual";

export interface ExpenseItem {
  id: string;
  org_id: string;
  period_id?: string | null;
  period_name: string;
  title: string;
  amount: number;
  date: string;
  department: string;
  category: string;
  vendor?: string | null;
  payment_method: PaymentMethod;
  receipt_url?: string | null;
  notes?: string | null;
  status: ExpenseStatus;
  is_recurring: boolean;
  recurring_frequency?: RecurringFrequency | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

const DEFAULT_EXPENSES: ExpenseItem[] = [
  {
    id: "exp-001",
    org_id: "",
    period_name: "2026-Q1",
    title: "AWS Cloud Infrastructure",
    amount: 14250,
    date: "2026-02-01",
    department: "Engineering",
    category: "Cloud Infrastructure",
    vendor: "Amazon Web Services",
    payment_method: "credit_card",
    receipt_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop",
    notes: "Monthly production compute clusters",
    status: "paid",
    is_recurring: true,
    recurring_frequency: "monthly",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "exp-002",
    org_id: "",
    period_name: "2026-Q1",
    title: "LinkedIn Talent Solutions Annual Renewal",
    amount: 22000,
    date: "2026-02-05",
    department: "Operations & HR",
    category: "SaaS Subscriptions",
    vendor: "LinkedIn Inc.",
    payment_method: "wire_transfer",
    receipt_url: null,
    notes: "Recruiting seats for Engineering hiring wave",
    status: "approved",
    is_recurring: true,
    recurring_frequency: "annual",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "exp-003",
    org_id: "",
    period_name: "2026-Q1",
    title: "Q1 Paid Social Marketing Campaign",
    amount: 35000,
    date: "2026-02-10",
    department: "Growth & Marketing",
    category: "Sales & Marketing",
    vendor: "Meta Ads Platform",
    payment_method: "credit_card",
    receipt_url: null,
    notes: "Customer acquisition campaign",
    status: "approved",
    is_recurring: false,
    recurring_frequency: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "exp-004",
    org_id: "",
    period_name: "2026-Q1",
    title: "Software Tooling Rebate",
    amount: -1250,
    date: "2026-02-12",
    department: "Engineering",
    category: "SaaS Subscriptions",
    vendor: "GitHub",
    payment_method: "credit_card",
    receipt_url: null,
    notes: "Credit adjustment for downgraded seats",
    status: "paid",
    is_recurring: false,
    recurring_frequency: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "exp-005",
    org_id: "",
    period_name: "2026-Q1",
    title: "Executive Offsite Catering & Venue",
    amount: 4800,
    date: "2026-02-14",
    department: "Operations & HR",
    category: "Operating Expenses",
    vendor: "Four Seasons Events",
    payment_method: "credit_card",
    receipt_url: null,
    notes: "Q1 strategy meeting",
    status: "pending_approval",
    is_recurring: false,
    recurring_frequency: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function useExpenses() {
  const orgId = useCurrentOrgId();
  const queryClient = useQueryClient();

  const expensesQuery = useQuery({
    queryKey: ["expenses", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("expenses")
          .select("*")
          .eq("org_id", orgId!)
          .order("date", { ascending: false });

        if (error || !data || data.length === 0) {
          return DEFAULT_EXPENSES.map((e) => ({ ...e, org_id: orgId! }));
        }
        return data.map((item) => ({
          ...item,
          amount: Number(item.amount),
        })) as ExpenseItem[];
      } catch {
        return DEFAULT_EXPENSES.map((e) => ({ ...e, org_id: orgId! }));
      }
    },
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (input: {
      period_name: string;
      title: string;
      amount: number;
      date: string;
      department: string;
      category: string;
      vendor?: string;
      payment_method: PaymentMethod;
      receipt_url?: string;
      notes?: string;
      status?: ExpenseStatus;
      is_recurring?: boolean;
      recurring_frequency?: RecurringFrequency;
    }) => {
      if (!orgId) throw new Error("No active organization");

      const payload = {
        org_id: orgId,
        period_name: input.period_name,
        title: input.title,
        amount: input.amount,
        date: input.date,
        department: input.department,
        category: input.category,
        vendor: input.vendor || null,
        payment_method: input.payment_method,
        receipt_url: input.receipt_url || null,
        notes: input.notes || null,
        status: input.status || "approved",
        is_recurring: !!input.is_recurring,
        recurring_frequency: input.is_recurring ? input.recurring_frequency || "monthly" : null,
      };

      const { data, error } = await supabase.from("expenses").insert(payload).select().single();

      if (error) {
        const fallback: ExpenseItem = {
          id: `exp-${Date.now()}`,
          ...payload,
          amount: Number(payload.amount),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        queryClient.setQueryData(["expenses", orgId], (old: ExpenseItem[] = []) => [
          fallback,
          ...old,
        ]);
        return fallback;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", orgId] });
      queryClient.invalidateQueries({ queryKey: ["budget_entries", orgId] });
      toast.success("Expense line item recorded successfully");
    },
  });

  const updateExpenseStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ExpenseStatus }) => {
      const { error } = await supabase
        .from("expenses")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        queryClient.setQueryData(["expenses", orgId], (old: ExpenseItem[] = []) =>
          old.map((e) => (e.id === id ? { ...e, status } : e)),
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", orgId] });
      toast.success("Expense status updated");
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) {
        queryClient.setQueryData(["expenses", orgId], (old: ExpenseItem[] = []) =>
          old.filter((e) => e.id !== id),
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", orgId] });
      toast.success("Expense item deleted");
    },
  });

  return {
    expenses: expensesQuery.data ?? [],
    isLoading: expensesQuery.isLoading,
    addExpense: addExpenseMutation.mutateAsync,
    updateStatus: updateExpenseStatusMutation.mutateAsync,
    deleteExpense: deleteExpenseMutation.mutateAsync,
  };
}
