import { useCurrentOrg, type OrgRole } from "./use-org";

export type AppPermission =
  | "budget:view"
  | "budget:create"
  | "budget:edit"
  | "budget:delete"
  | "budget:approve"
  | "budget:import"
  | "budget:export"
  | "team:view"
  | "team:invite"
  | "team:manage_roles"
  | "team:remove_member"
  | "org:view_settings"
  | "org:edit_settings"
  | "org:delete";

const ROLE_PERMISSIONS: Record<OrgRole, AppPermission[]> = {
  owner: [
    "budget:view",
    "budget:create",
    "budget:edit",
    "budget:delete",
    "budget:approve",
    "budget:import",
    "budget:export",
    "team:view",
    "team:invite",
    "team:manage_roles",
    "team:remove_member",
    "org:view_settings",
    "org:edit_settings",
    "org:delete",
  ],
  admin: [
    "budget:view",
    "budget:create",
    "budget:edit",
    "budget:delete",
    "budget:approve",
    "budget:import",
    "budget:export",
    "team:view",
    "team:invite",
    "team:manage_roles",
    "team:remove_member",
    "org:view_settings",
    "org:edit_settings",
  ],
  finance_manager: [
    "budget:view",
    "budget:create",
    "budget:edit",
    "budget:delete",
    "budget:approve",
    "budget:import",
    "budget:export",
    "team:view",
    "org:view_settings",
  ],
  department_lead: [
    "budget:view",
    "budget:create",
    "budget:edit",
    "budget:import",
    "budget:export",
    "team:view",
  ],
  contributor: ["budget:view", "budget:create", "budget:export", "team:view"],
  member: ["budget:view", "budget:create", "budget:edit", "budget:export", "team:view"],
  viewer: ["budget:view", "budget:export"],
};

export function hasPermission(
  role: OrgRole | null | undefined,
  permission: AppPermission,
): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function useHasPermission(permission: AppPermission): boolean {
  const { currentRole } = useCurrentOrg();
  return hasPermission(currentRole, permission);
}

export function usePermissions() {
  const { currentRole } = useCurrentOrg();
  const permissions = currentRole ? ROLE_PERMISSIONS[currentRole] || [] : [];

  return {
    role: currentRole,
    permissions,
    can: (permission: AppPermission) => permissions.includes(permission),
    isOwner: currentRole === "owner",
    isAdmin: currentRole === "admin" || currentRole === "owner",
    isFinanceManager:
      currentRole === "finance_manager" || currentRole === "admin" || currentRole === "owner",
    isLead:
      currentRole === "department_lead" ||
      currentRole === "finance_manager" ||
      currentRole === "admin" ||
      currentRole === "owner",
    isViewerOnly: currentRole === "viewer",
  };
}
