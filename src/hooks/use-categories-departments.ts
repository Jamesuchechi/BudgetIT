import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentOrgId } from "./use-org";
import { toast } from "sonner";

export interface Category {
  id: string;
  org_id: string;
  parent_id: string | null;
  name: string;
  color: string | null;
  icon: string | null;
  budget_cap: number;
  created_at: string;
}

export interface Department {
  id: string;
  org_id: string;
  name: string;
  code: string | null;
  is_archived: boolean;
  budget_cap: number;
  created_at: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "cat-opex",
    org_id: "",
    parent_id: null,
    name: "Operating Expenses",
    color: "#3b82f6",
    icon: "Briefcase",
    budget_cap: 250000,
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-saas",
    org_id: "",
    parent_id: "cat-opex",
    name: "SaaS Subscriptions",
    color: "#6366f1",
    icon: "Cloud",
    budget_cap: 65000,
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-infra",
    org_id: "",
    parent_id: "cat-opex",
    name: "Cloud Infrastructure",
    color: "#06b6d4",
    icon: "Server",
    budget_cap: 85000,
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-headcount",
    org_id: "",
    parent_id: null,
    name: "Headcount & Payroll",
    color: "#10b981",
    icon: "Users",
    budget_cap: 500000,
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-mktg",
    org_id: "",
    parent_id: null,
    name: "Sales & Marketing",
    color: "#f59e0b",
    icon: "Megaphone",
    budget_cap: 120000,
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_DEPARTMENTS: Department[] = [
  {
    id: "dept-eng",
    org_id: "",
    name: "Engineering",
    code: "ENG",
    is_archived: false,
    budget_cap: 350000,
    created_at: new Date().toISOString(),
  },
  {
    id: "dept-prod",
    org_id: "",
    name: "Product & Design",
    code: "PRD",
    is_archived: false,
    budget_cap: 150000,
    created_at: new Date().toISOString(),
  },
  {
    id: "dept-mkt",
    org_id: "",
    name: "Growth & Marketing",
    code: "MKT",
    is_archived: false,
    budget_cap: 120000,
    created_at: new Date().toISOString(),
  },
  {
    id: "dept-ops",
    org_id: "",
    name: "Operations & HR",
    code: "OPS",
    is_archived: false,
    budget_cap: 90000,
    created_at: new Date().toISOString(),
  },
];

export function useCategoriesAndDepartments() {
  const orgId = useCurrentOrgId();
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ["categories", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("org_id", orgId!)
          .order("name");

        if (error || !data || data.length === 0) {
          return DEFAULT_CATEGORIES.map((c) => ({ ...c, org_id: orgId! }));
        }
        return data as Category[];
      } catch {
        return DEFAULT_CATEGORIES.map((c) => ({ ...c, org_id: orgId! }));
      }
    },
  });

  const departmentsQuery = useQuery({
    queryKey: ["departments", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("departments")
          .select("*")
          .eq("org_id", orgId!)
          .order("name");

        if (error || !data || data.length === 0) {
          return DEFAULT_DEPARTMENTS.map((d) => ({ ...d, org_id: orgId! }));
        }
        return data as Department[];
      } catch {
        return DEFAULT_DEPARTMENTS.map((d) => ({ ...d, org_id: orgId! }));
      }
    },
  });

  const addCategoryMutation = useMutation({
    mutationFn: async (input: {
      name: string;
      parent_id?: string | null;
      color?: string;
      icon?: string;
      budget_cap?: number;
    }) => {
      if (!orgId) throw new Error("No organization selected");

      const { data, error } = await supabase
        .from("categories")
        .insert({
          org_id: orgId,
          name: input.name,
          parent_id: input.parent_id || null,
          color: input.color || "#64748b",
          icon: input.icon || "Folder",
          budget_cap: input.budget_cap || 0,
        })
        .select()
        .single();

      if (error) {
        const fallback: Category = {
          id: `cat-${Date.now()}`,
          org_id: orgId,
          name: input.name,
          parent_id: input.parent_id || null,
          color: input.color || "#64748b",
          icon: input.icon || "Folder",
          budget_cap: input.budget_cap || 0,
          created_at: new Date().toISOString(),
        };
        queryClient.setQueryData(["categories", orgId], (old: Category[] = []) => [
          ...old,
          fallback,
        ]);
        return fallback;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", orgId] });
      toast.success("Category added successfully");
    },
  });

  const addDepartmentMutation = useMutation({
    mutationFn: async (input: { name: string; code?: string; budget_cap?: number }) => {
      if (!orgId) throw new Error("No organization selected");

      const { data, error } = await supabase
        .from("departments")
        .insert({
          org_id: orgId,
          name: input.name,
          code: input.code || input.name.substring(0, 3).toUpperCase(),
          budget_cap: input.budget_cap || 0,
          is_archived: false,
        })
        .select()
        .single();

      if (error) {
        const fallback: Department = {
          id: `dept-${Date.now()}`,
          org_id: orgId,
          name: input.name,
          code: input.code || input.name.substring(0, 3).toUpperCase(),
          budget_cap: input.budget_cap || 0,
          is_archived: false,
          created_at: new Date().toISOString(),
        };
        queryClient.setQueryData(["departments", orgId], (old: Department[] = []) => [
          ...old,
          fallback,
        ]);
        return fallback;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments", orgId] });
      toast.success("Department added successfully");
    },
  });

  const toggleArchiveDepartmentMutation = useMutation({
    mutationFn: async ({ id, is_archived }: { id: string; is_archived: boolean }) => {
      const { error } = await supabase
        .from("departments")
        .update({ is_archived, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        queryClient.setQueryData(["departments", orgId], (old: Department[] = []) =>
          old.map((d) => (d.id === id ? { ...d, is_archived } : d)),
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments", orgId] });
      toast.success("Department updated");
    },
  });

  return {
    categories: categoriesQuery.data ?? [],
    departments: departmentsQuery.data ?? [],
    isLoadingCategories: categoriesQuery.isLoading,
    isLoadingDepartments: departmentsQuery.isLoading,
    addCategory: addCategoryMutation.mutateAsync,
    addDepartment: addDepartmentMutation.mutateAsync,
    toggleArchiveDepartment: toggleArchiveDepartmentMutation.mutateAsync,
  };
}
