import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, PageBody } from "@/components/app/page";
import { useMemberships, useCurrentOrgId } from "@/hooks/use-org";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LinkIcon } from "lucide-react";
import { requireOrgAdmin } from "@/lib/require-admin";

export const Route = createFileRoute("/app/settings")({
  beforeLoad: requireOrgAdmin,
  component: SettingsPage,
});

function SettingsPage() {
  const orgId = useCurrentOrgId();
  const memberships = useMemberships();
  const current = memberships.data?.find((m) => m.org_id === orgId);
  const isAdmin = current?.role === "admin";
  const qc = useQueryClient();

  const org = useQuery({
    queryKey: ["org", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase.from("organizations").select("*").eq("id", orgId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!orgId || !name.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("organizations").update({ name }).eq("id", orgId);
      if (error) throw error;
      toast.success("Saved");
      qc.invalidateQueries();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setSaving(false); }
  }

  return (
    <>
      <PageHeader title="Settings" description="Workspace settings and integrations." />
      <PageBody>
        <div className="space-y-8">
          <section className="rounded-lg border border-border p-4 sm:p-6">
            <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Organization</h2>
            {!isAdmin && (
              <Alert className="mt-4"><AlertDescription>Only admins can change organization settings.</AlertDescription></Alert>
            )}
            <div className="mt-4 space-y-4">
              <div className="space-y-1.5 max-w-md">
                <Label>Organization name</Label>
                <Input
                  className="min-h-11"
                  defaultValue={org.data?.name ?? ""}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isAdmin}
                />
              </div>
              {isAdmin && (
                <Button onClick={save} disabled={saving || !name.trim() || name === org.data?.name} className="w-full sm:w-auto min-h-11">
                  {saving ? "Saving…" : "Save"}
                </Button>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-border p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Connect your system</h2>
                <p className="mt-2 max-w-prose text-sm text-muted-foreground">
                  Direct connectors for Salesforce, HubSpot, and QuickBooks are on the roadmap.
                  Each user will authorize their own instance — we won't ship a shared built-in connection.
                  For now, use the CSV import on the Import page.
                </p>
              </div>
              <span className="shrink-0 self-start rounded-full border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Coming soon
              </span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {["Salesforce", "HubSpot", "QuickBooks"].map((p) => (
                <div key={p} className="flex items-center justify-between rounded-md border border-border p-4">
                  <div className="flex items-center gap-3">
                    <LinkIcon className="h-4 w-4" />
                    <span className="font-medium">{p}</span>
                  </div>
                  <Button variant="outline" size="sm" disabled>Connect</Button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-border p-4 sm:p-6">
            <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Documentation</h2>
            <p className="mt-2 max-w-prose text-sm text-muted-foreground">
              How BudgetIT works, getting started, remixing this template, and known gaps.
            </p>
            <Link
              to="/docs"
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-accent"
            >
              Open documentation →
            </Link>
          </section>
        </div>
      </PageBody>
    </>
  );
}
