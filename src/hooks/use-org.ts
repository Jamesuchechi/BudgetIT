import { useQuery } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

export type OrgRole =
  "owner" | "admin" | "finance_manager" | "department_lead" | "contributor" | "viewer" | "member";

export interface OrganizationDetails {
  id: string;
  name: string;
  industry?: string | null;
  company_size?: string | null;
  logo_url?: string | null;
  fiscal_year_start?: string | null;
  base_currency?: string | null;
  number_format?: string | null;
  onboarding_completed?: boolean;
}

export interface OrgMembership {
  org_id: string;
  role: OrgRole;
  organizations: OrganizationDetails;
}

export function useMemberships() {
  return useQuery({
    queryKey: ["memberships"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return [] as OrgMembership[];
      const { data, error } = await supabase
        .from("org_members")
        .select(
          "org_id, role, organizations(id, name, industry, company_size, logo_url, fiscal_year_start, base_currency, number_format, onboarding_completed)",
        )
        .eq("user_id", userData.user.id);
      if (error) throw error;
      return (data ?? []) as unknown as OrgMembership[];
    },
  });
}

const ORG_KEY = "bp_current_org";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function getSnapshot(): string | null {
  return localStorage.getItem(ORG_KEY);
}

export function useCurrentOrgId(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

export function setCurrentOrgId(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ORG_KEY, id);
  listeners.forEach((cb) => cb());
}

export function useCurrentOrg() {
  const currentOrgId = useCurrentOrgId();
  const { data: memberships } = useMemberships();
  const currentMembership = memberships?.find((m) => m.org_id === currentOrgId);
  const currentOrg = currentMembership?.organizations ?? null;
  const currentRole = currentMembership?.role ?? null;
  return { currentOrgId, currentOrg, currentRole, currentMembership, memberships };
}

export const useOrg = useCurrentOrg;
