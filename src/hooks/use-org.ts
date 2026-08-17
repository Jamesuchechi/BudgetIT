import { useQuery } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";


export type OrgRole = "admin" | "member" | "viewer";

export interface OrgMembership {
  org_id: string;
  role: OrgRole;
  organizations: { id: string; name: string };
}

export function useMemberships() {
  return useQuery({
    queryKey: ["memberships"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return [] as OrgMembership[];
      const { data, error } = await supabase
        .from("org_members")
        .select("org_id, role, organizations(id, name)")
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

