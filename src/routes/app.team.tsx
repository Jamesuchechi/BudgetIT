import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageBody } from "@/components/app/page";
import { useCurrentOrgId, useMemberships, type OrgRole } from "@/hooks/use-org";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Trash2 } from "lucide-react";
import { requireOrgAdmin } from "@/lib/require-admin";

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


function TeamPage() {
  const orgId = useCurrentOrgId();
  const memberships = useMemberships();
  const current = memberships.data?.find((m) => m.org_id === orgId);
  const isAdmin = current?.role === "admin";
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null)); }, []);
  const qc = useQueryClient();

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
  const [role, setRole] = useState<OrgRole>("member");
  const [busy, setBusy] = useState(false);
  const [inviteLink, setInviteLink] = useState<{ email: string; link: string } | null>(null);

  async function copyLink(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Invite link copied");
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
      toast.success(`Invite created for ${email}. Share the link below.`);
      setEmail("");
      qc.invalidateQueries({ queryKey: ["invites", orgId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to invite");
    } finally { setBusy(false); }
  }


  async function changeRole(memberId: string, newRole: OrgRole) {
    const { error } = await supabase.from("org_members").update({ role: newRole }).eq("id", memberId);
    if (error) return toast.error(error.message);
    toast.success("Role updated");
    qc.invalidateQueries({ queryKey: ["members", orgId] });
  }

  async function remove(memberId: string) {
    if (!confirm("Remove this member?")) return;
    const { error } = await supabase.from("org_members").delete().eq("id", memberId);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    qc.invalidateQueries({ queryKey: ["members", orgId] });
  }

  async function revokeInvite(id: string) {
    const { error } = await supabase.from("org_invites").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["invites", orgId] });
  }

  return (
    <>
      <PageHeader title="Team" description="Invite teammates and manage roles." />
      <PageBody>
        {!isAdmin ? (
          <Alert><AlertDescription>Only admins can manage users. You have {current?.role ?? "member"} access.</AlertDescription></Alert>
        ) : (
          <section className="mb-8 rounded-lg border border-border p-4 sm:p-6">
            <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Invite by email</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px_auto]">
              <div className="space-y-1.5"><Label>Email</Label><Input type="email" className="min-h-11" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@company.com" /></div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as OrgRole)}>
                  <SelectTrigger className="min-h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end"><Button onClick={invite} disabled={busy || !email} className="w-full min-h-11">Send invite</Button></div>
            </div>
            {inviteLink && (
              <div className="mt-4 rounded-lg border border-border p-3 sm:p-4">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Invite link for {inviteLink.email}
                </div>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <code className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-2 text-xs">{inviteLink.link}</code>
                  <Button variant="outline" className="min-h-11 w-full sm:w-auto" onClick={() => copyLink(inviteLink.link)}>
                    <Copy className="h-4 w-4" /> Copy link
                  </Button>
                </div>
              </div>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Invites aren't emailed automatically — send the link yourself. It expires in 7 days and only
              works for the invited email address, after that person signs in and confirms it.
            </p>

          </section>
        )}

        <section className="rounded-lg border border-border">
          <div className="border-b border-border p-4">
            <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Members</h2>
          </div>
          <ul className="divide-y divide-border">
            {members.data?.map((m) => (
              <li key={m.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-4 sm:flex sm:justify-between">
                <div className="min-w-0">
                  <div className="truncate font-medium">{m.profiles?.full_name || m.profiles?.email || "Member"}</div>
                  <div className="truncate text-xs text-muted-foreground">{m.profiles?.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && m.user_id !== currentUserId ? (
                    <Select value={m.role} onValueChange={(v) => changeRole(m.id, v as OrgRole)}>
                      <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="rounded-full border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-widest">{m.role}</span>
                  )}
                  {isAdmin && (
                    <Button variant="ghost" size="icon" onClick={() => remove(m.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {isAdmin && invites.data && invites.data.length > 0 && (
          <section className="mt-8 rounded-lg border border-border">
            <div className="border-b border-border p-4">
              <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Pending invites</h2>
            </div>
            <ul className="divide-y divide-border">
              {invites.data.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{i.email}</div>
                    <div className="text-xs text-muted-foreground">
                      Role: {i.role} · expires {new Date(i.expires_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyLink(`${window.location.origin}/accept-invite?token=${i.token}`)}
                    >
                      <Copy className="h-4 w-4" /> Copy link
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => revokeInvite(i.id)}>Revoke</Button>
                  </div>
                </li>
              ))}

            </ul>
          </section>
        )}
      </PageBody>
    </>
  );
}
