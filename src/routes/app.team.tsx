import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageBody } from "@/components/app/page";
import { useCurrentOrgId, useMemberships, type OrgRole } from "@/hooks/use-org";
import { usePermissions } from "@/hooks/use-permission";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Copy,
  Trash2,
  Search,
  Filter,
  Mail,
  Users,
  RefreshCw,
  Clock,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { requireOrgAdmin } from "@/lib/require-admin";
import { BulkInviteModal } from "@/components/app/bulk-invite-modal";

export const Route = createFileRoute("/app/team")({
  beforeLoad: requireOrgAdmin,
  component: TeamPage,
});

interface MemberRow {
  id: string;
  user_id: string;
  role: OrgRole;
  created_at: string;
  profiles: { email: string; full_name: string | null } | null;
}

interface InviteRow {
  id: string;
  email: string;
  role: OrgRole;
  created_at: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
}

const ROLE_LABELS: Record<OrgRole, string> = {
  owner: "Owner",
  admin: "Admin",
  finance_manager: "Finance Manager",
  department_lead: "Department Lead",
  contributor: "Contributor",
  member: "Member",
  viewer: "Viewer",
};

function TeamPage() {
  const orgId = useCurrentOrgId();
  const memberships = useMemberships();
  const { isAdmin, isOwner } = usePermissions();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);
  const qc = useQueryClient();

  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const members = useQuery({
    queryKey: ["members", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("org_members")
        .select("id, user_id, role, created_at, profiles(email, full_name)")
        .eq("org_id", orgId!)
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as unknown as MemberRow[];
    },
  });

  const invites = useQuery({
    queryKey: ["invites", orgId],
    enabled: !!orgId && isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("org_invites")
        .select("*")
        .eq("org_id", orgId!)
        .is("accepted_at", null);

      if (error) throw error;
      return (data ?? []) as InviteRow[];
    },
  });

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrgRole>("contributor");
  const [busy, setBusy] = useState(false);
  const [inviteLink, setInviteLink] = useState<{ email: string; link: string } | null>(null);

  async function copyLink(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Invite link copied to clipboard");
    } catch {
      toast.error("Couldn't copy — select the link and copy it manually");
    }
  }

  async function invite() {
    if (!orgId || !email) return;
    setBusy(true);
    try {
      const { data, error } = await supabase
        .from("org_invites")
        .insert({ org_id: orgId, email: email.toLowerCase(), role })
        .select("token")
        .single();
      if (error) throw error;
      const link = `${window.location.origin}/accept-invite?token=${data.token}`;
      setInviteLink({ email: email.toLowerCase(), link });
      toast.success(`Invite created for ${email}. Link generated below.`);
      setEmail("");
      qc.invalidateQueries({ queryKey: ["invites", orgId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to invite");
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(memberId: string, newRole: OrgRole) {
    const { error } = await supabase
      .from("org_members")
      .update({ role: newRole })
      .eq("id", memberId);
    if (error) return toast.error(error.message);
    toast.success("Member role updated");
    qc.invalidateQueries({ queryKey: ["members", orgId] });
  }

  async function remove(memberId: string) {
    if (!confirm("Are you sure you want to remove this team member?")) return;
    const { error } = await supabase.from("org_members").delete().eq("id", memberId);
    if (error) return toast.error(error.message);
    toast.success("Team member removed");
    qc.invalidateQueries({ queryKey: ["members", orgId] });
  }

  async function revokeInvite(id: string) {
    const { error } = await supabase.from("org_invites").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Invitation revoked");
    qc.invalidateQueries({ queryKey: ["invites", orgId] });
  }

  async function resendInvite(inviteRow: InviteRow) {
    // Generate new token & reset expiration date to 7 days from now
    const newExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase
      .from("org_invites")
      .update({ expires_at: newExpires })
      .eq("id", inviteRow.id);
    if (error) return toast.error(error.message);

    const link = `${window.location.origin}/accept-invite?token=${inviteRow.token}`;
    await copyLink(link);
    toast.success(`Invite refreshed for ${inviteRow.email}! Link copied.`);
    qc.invalidateQueries({ queryKey: ["invites", orgId] });
  }

  // Filter members by search query and role filter
  const filteredMembers = (members.data ?? []).filter((m) => {
    const nameMatch =
      m.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
    const emailMatch =
      m.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
    const matchesSearch = searchQuery === "" || nameMatch || emailMatch;
    const matchesRole = roleFilter === "all" || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <>
      <PageHeader
        title="Team & Access Governance"
        description="Invite team members, assign granular RBAC roles, and manage pending invites."
      />
      <PageBody>
        {orgId && (
          <BulkInviteModal open={bulkModalOpen} onOpenChange={setBulkModalOpen} orgId={orgId} />
        )}

        {!isAdmin ? (
          <Alert className="mb-6">
            <AlertDescription>
              Only workspace admins can invite and manage team members.
            </AlertDescription>
          </Alert>
        ) : (
          <section className="mb-8 rounded-lg border border-border bg-card p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">
                  Invite New Teammates
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Send single invites or upload a CSV file for bulk invitations.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkModalOpen(true)}
                className="gap-2 shrink-0 font-medium"
              >
                <UserPlus className="h-4 w-4 text-primary" /> Bulk Invite CSV
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_200px_auto]">
              <div className="space-y-1.5">
                <Label>Work Email</Label>
                <Input
                  type="email"
                  className="min-h-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Assigned Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as OrgRole)}>
                  <SelectTrigger className="min-h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="finance_manager">Finance Manager</SelectItem>
                    <SelectItem value="department_lead">Department Lead</SelectItem>
                    <SelectItem value="contributor">Contributor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={invite}
                  disabled={busy || !email.trim()}
                  className="w-full min-h-11 font-semibold gap-1.5"
                >
                  <Mail className="h-4 w-4" /> Send Invite
                </Button>
              </div>
            </div>

            {inviteLink && (
              <div className="mt-4 rounded-lg border border-border bg-muted/50 p-3 sm:p-4">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Direct Invitation Link for {inviteLink.email}
                </div>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <code className="min-w-0 flex-1 truncate rounded bg-background border border-border px-3 py-2 text-xs font-mono">
                    {inviteLink.link}
                  </code>
                  <Button
                    variant="outline"
                    className="min-h-11 shrink-0 gap-1.5"
                    onClick={() => copyLink(inviteLink.link)}
                  >
                    <Copy className="h-4 w-4" /> Copy Link
                  </Button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Member Directory */}
        <section className="rounded-lg border border-border bg-card shadow-sm mb-8">
          <div className="border-b border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Active Members ({filteredMembers.length})
              </h2>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name or email…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 min-h-10 text-xs"
                />
              </div>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[140px] min-h-10 text-xs">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="finance_manager">Finance Manager</SelectItem>
                  <SelectItem value="department_lead">Department Lead</SelectItem>
                  <SelectItem value="contributor">Contributor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ul className="divide-y divide-border">
            {filteredMembers.length === 0 ? (
              <li className="p-8 text-center text-sm text-muted-foreground">
                No team members match your filter criteria.
              </li>
            ) : (
              filteredMembers.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs grid place-items-center shrink-0 uppercase">
                      {(m.profiles?.full_name || m.profiles?.email || "U")[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-sm">
                        {m.profiles?.full_name || "Workspace Member"}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {m.profiles?.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {isAdmin && m.user_id !== currentUserId ? (
                      <Select value={m.role} onValueChange={(v) => changeRole(m.id, v as OrgRole)}>
                        <SelectTrigger className="w-[160px] min-h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="finance_manager">Finance Manager</SelectItem>
                          <SelectItem value="department_lead">Department Lead</SelectItem>
                          <SelectItem value="contributor">Contributor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="rounded-full border border-border bg-muted px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {ROLE_LABELS[m.role] || m.role}
                      </span>
                    )}

                    {isAdmin && m.user_id !== currentUserId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(m.id)}
                        title="Remove member"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Pending Invitations Section */}
        {isAdmin && invites.data && invites.data.length > 0 && (
          <section className="rounded-lg border border-border bg-card shadow-sm">
            <div className="border-b border-border p-4">
              <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" /> Pending Invitations (
                {invites.data.length})
              </h2>
            </div>
            <ul className="divide-y divide-border">
              {invites.data.map((i) => {
                const expiresDate = new Date(i.expires_at);
                const isExpired = expiresDate.getTime() < Date.now();
                const daysRemaining = Math.max(
                  0,
                  Math.ceil((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
                );

                return (
                  <li
                    key={i.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-sm flex items-center gap-2">
                        {i.email}
                        <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {ROLE_LABELS[i.role] || i.role}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                        {isExpired ? (
                          <span className="text-destructive font-semibold">Expired</span>
                        ) : (
                          <span>Expires in {daysRemaining} day(s)</span>
                        )}
                        <span>•</span>
                        <span>Sent {new Date(i.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs font-medium"
                        onClick={() => resendInvite(i)}
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Resend
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-destructive hover:bg-destructive/10"
                        onClick={() => revokeInvite(i.id)}
                      >
                        Revoke
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </PageBody>
    </>
  );
}
