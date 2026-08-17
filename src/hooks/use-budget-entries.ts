import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentOrgId } from "./use-org";

export interface BudgetEntry {
  id: string;
  org_id: string;
  category: string;
  department: string;
  budgeted_amount: number;
  actual_amount: number;
  period: string;
  vendor: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export function useBudgetEntries() {
  const orgId = useCurrentOrgId();
  return useQuery({
    queryKey: ["budget_entries", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budget_entries")
        .select("*")
        .eq("org_id", orgId!)
        .order("period", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        ...r,
        budgeted_amount: Number(r.budgeted_amount),
        actual_amount: Number(r.actual_amount),
      })) as BudgetEntry[];
    },
  });
}
