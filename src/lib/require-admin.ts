import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/**
 * Defence in depth for admin-only routes.
 *
 * The database remains the authority — every RLS policy is unchanged. This
 * simply stops the UI from loading a page it will not let you use, so typing
 * /app/team or /app/settings directly no longer bypasses the sidebar filter.
 */
export async function requireOrgAdmin(): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw redirect({ to: "/auth" });

  const { data: memberships, error } = await supabase
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", userData.user.id);

  if (error || !memberships || memberships.length === 0) {
    throw redirect({ to: "/app/dashboard" });
  }

  const stored = typeof window !== "undefined" ? localStorage.getItem("bp_current_org") : null;
  // Mirror the shell: fall back to the first membership when nothing is selected
  // yet, or when the stored org is not one the caller belongs to.
  const active = memberships.find((m) => m.org_id === stored) ?? memberships[0];

  if (active.role !== "admin") throw redirect({ to: "/app/dashboard" });
}
