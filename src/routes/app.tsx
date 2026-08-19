import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useLocation,
  redirect,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemberships, setCurrentOrgId, useCurrentOrgId } from "@/hooks/use-org";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  BarChart3,
  Upload,
  Download,
  Settings,
  Users,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Check,
  ChevronsUpDown,
  BookOpen,
  Activity,
  Calendar,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/app")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { userId: data.user.id };
  },
  component: AppShell,
});

const navItems = [
  {
    to: "/app/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    adminOnly: false,
    writeOnly: false,
  },
  { to: "/app/budgets", label: "Budgets", icon: Calendar, adminOnly: false, writeOnly: false },
  { to: "/app/expenses", label: "Expenses", icon: Receipt, adminOnly: false, writeOnly: false },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3, adminOnly: false, writeOnly: false },
  { to: "/app/import", label: "Import", icon: Upload, adminOnly: false, writeOnly: true },
  { to: "/app/export", label: "Export", icon: Download, adminOnly: false, writeOnly: false },
  { to: "/app/team", label: "Team", icon: Users, adminOnly: true, writeOnly: false },
  { to: "/app/settings", label: "Settings", icon: Settings, adminOnly: true, writeOnly: false },
  { to: "/app/profile", label: "Profile", icon: UserIcon, adminOnly: false, writeOnly: false },
] as const;

import { CreateOrgModal } from "@/components/app/create-org-modal";
import { useIdleLogout } from "@/hooks/use-idle-logout";
import { AlertTriangle, Plus, Mail } from "lucide-react";

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const memberships = useMemberships();
  const queryClient = useQueryClient();
  const currentOrgId = useCurrentOrgId();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [orgPickerOpen, setOrgPickerOpen] = useState(false);
  const [createOrgModalOpen, setCreateOrgModalOpen] = useState(false);
  const [userEmailVerified, setUserEmailVerified] = useState(true);

  // Enable auto-logout on 30 minutes of idle inactivity
  useIdleLogout();

  // Check email verification status
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        // If email_confirmed_at exists, email is verified
        setUserEmailVerified(!!data.user.email_confirmed_at);
      }
    });
  }, []);

  // Ensure a valid org is selected
  useEffect(() => {
    if (!memberships.data) return;
    if (memberships.data.length === 0) return;
    if (!currentOrgId || !memberships.data.find((m) => m.org_id === currentOrgId)) {
      setCurrentOrgId(memberships.data[0].org_id);
      queryClient.invalidateQueries();
    }
  }, [memberships.data, currentOrgId, queryClient]);

  // Onboarding gate: admins of un-onboarded orgs are pushed to onboarding
  const orgStatus = useQuery({
    queryKey: ["org-onboarding", currentOrgId],
    enabled: !!currentOrgId,
    queryFn: async () => {
      const { data } = await supabase
        .from("organizations")
        .select("onboarding_completed")
        .eq("id", currentOrgId!)
        .maybeSingle();
      return data;
    },
  });
  const currentMembership = memberships.data?.find((m) => m.org_id === currentOrgId);
  useEffect(() => {
    if (!currentOrgId || !orgStatus.data || !currentMembership) return;
    if (orgStatus.data.onboarding_completed) return;
    if (currentMembership.role !== "admin" && currentMembership.role !== "owner") return;
    if (location.pathname.startsWith("/app/onboarding")) return;
    navigate({ to: "/app/onboarding", replace: true });
  }, [currentOrgId, orgStatus.data, currentMembership, location.pathname, navigate]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const current = memberships.data?.find((m) => m.org_id === currentOrgId);

  if (memberships.isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (memberships.data && memberships.data.length === 0) {
    return <NoOrgState onSignOut={signOut} />;
  }

  const SidebarInner = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border p-4">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <div className="grid h-7 w-7 place-items-center rounded-sm bg-foreground text-background ">
            <Activity className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <span>BudgetIT</span>
        </Link>
      </div>

      {/* Org switcher */}
      <div className="border-b border-border p-3">
        <button
          onClick={() => setOrgPickerOpen((o) => !o)}
          className="flex min-h-11 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-left text-sm hover:bg-accent"
        >
          <div className="min-w-0">
            <div className="truncate font-medium">
              {current?.organizations?.name ?? "Workspace"}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {current?.role}
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0" />
        </button>
        {orgPickerOpen && (
          <div className="mt-2 space-y-1 rounded-md border border-border bg-background p-1.5 shadow-md">
            {memberships.data?.map((m) => (
              <button
                key={m.org_id}
                onClick={() => {
                  setCurrentOrgId(m.org_id);
                  setOrgPickerOpen(false);
                  queryClient.invalidateQueries();
                }}
                className="flex min-h-11 w-full items-center justify-between rounded-md px-3 py-1.5 text-sm hover:bg-accent"
              >
                <span className="truncate font-medium">{m.organizations?.name}</span>
                {m.org_id === currentOrgId && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            ))}
            <div className="my-1 border-t border-border" />
            <button
              onClick={() => {
                setOrgPickerOpen(false);
                setCreateOrgModalOpen(true);
              }}
              className="flex min-h-11 w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
            >
              <Plus className="h-3.5 w-3.5" /> Create New Workspace
            </button>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems
          .filter(
            (i) =>
              (!i.adminOnly ||
                currentMembership?.role === "admin" ||
                currentMembership?.role === "owner") &&
              (!i.writeOnly || currentMembership?.role !== "viewer"),
          )
          .map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-foreground text-background font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        <Link
          to="/docs"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "mt-1 flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
            location.pathname.startsWith("/docs")
              ? "bg-foreground text-background font-medium"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <BookOpen className="h-4 w-4" />
          Docs
        </Link>
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={signOut}
          className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Create Org Modal */}
      <CreateOrgModal open={createOrgModalOpen} onOpenChange={setCreateOrgModalOpen} />

      {/* Mobile topbar */}
      <div className="flex items-center justify-between border-b border-border p-3 lg:hidden">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <div className="grid h-7 w-7 place-items-center rounded-sm bg-foreground text-background ">
            <Activity className="h-4 w-4" strokeWidth={2.5} />
          </div>
          BudgetIT
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="grid min-h-11 min-w-11 place-items-center rounded-md border border-border"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-border lg:block">{SidebarInner}</aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="absolute inset-0 bg-foreground/40"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative w-72 border-r border-border bg-background">
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="absolute right-3 top-3 grid min-h-11 min-w-11 place-items-center rounded-md hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
              {SidebarInner}
            </div>
          </div>
        )}

        <main className="min-w-0">
          {!userEmailVerified && (
            <div className="flex items-center justify-between gap-3 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  Your email address is unverified. Please check your inbox or resend verification.
                </span>
              </div>
              <button
                onClick={async () => {
                  const { data } = await supabase.auth.getUser();
                  if (data.user?.email) {
                    await supabase.auth.resend({ type: "signup", email: data.user.email });
                    toast.success("Verification email resent!");
                  }
                }}
                className="shrink-0 rounded bg-amber-500/20 px-2.5 py-1 text-amber-700 dark:text-amber-300 hover:bg-amber-500/30 font-semibold"
              >
                Resend Verification
              </button>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NoOrgState({ onSignOut }: { onSignOut: () => void }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const queryClient = useQueryClient();

  async function create() {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("create_organization", { _name: name });
      if (error) throw error;
      if (data) setCurrentOrgId(data as unknown as string);
      queryClient.invalidateQueries();
      toast.success("Workspace created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="grid min-h-screen place-items-center bg-background p-6">
      <div className="w-full max-w-md rounded-lg border border-border p-8">
        <h2 className="text-2xl font-black tracking-tight">No workspace yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Create one to get started. You can invite teammates afterwards.
        </p>
        <input
          value={name}
          maxLength={100}
          onChange={(e) => setName(e.target.value)}
          placeholder="Organization name"
          className="mt-6 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={create}
          disabled={busy}
          className="mt-3 w-full rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create workspace"}
        </button>
        <button
          onClick={onSignOut}
          className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
