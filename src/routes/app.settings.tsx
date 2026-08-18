import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader, PageBody } from "@/components/app/page";
import { useMemberships, useCurrentOrgId, setCurrentOrgId } from "@/hooks/use-org";
import { usePermissions } from "@/hooks/use-permission";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LinkIcon,
  Building2,
  Calendar,
  DollarSign,
  AlertTriangle,
  Trash2,
  Image,
  Save,
} from "lucide-react";
import { requireOrgAdmin } from "@/lib/require-admin";

export const Route = createFileRoute("/app/settings")({
  beforeLoad: requireOrgAdmin,
  component: SettingsPage,
});

function SettingsPage() {
  const orgId = useCurrentOrgId();
  const memberships = useMemberships();
  const { isOwner, isAdmin } = usePermissions();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const org = useQuery({
    queryKey: ["org", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", orgId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [fiscalYearStart, setFiscalYearStart] = useState("January");
  const [baseCurrency, setBaseCurrency] = useState("USD ($)");
  const [numberFormat, setNumberFormat] = useState("1,234.56");
  const [saving, setSaving] = useState(false);

  // Sync loaded org data into state
  useEffect(() => {
    if (org.data) {
      setName(org.data.name ?? "");
      setIndustry(org.data.industry ?? "Technology / SaaS");
      setCompanySize(org.data.company_size ?? "11-50");
      setLogoUrl(org.data.logo_url ?? "");
      setFiscalYearStart(org.data.fiscal_year_start ?? "January");
      setBaseCurrency(org.data.base_currency ?? "USD ($)");
      setNumberFormat(org.data.number_format ?? "1,234.56");
    }
  }, [org.data]);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function save() {
    if (!orgId || !name.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("organizations")
        .update({
          name,
          industry,
          company_size: companySize,
          logo_url: logoUrl || null,
          fiscal_year_start: fiscalYearStart,
          base_currency: baseCurrency,
          number_format: numberFormat,
        })
        .eq("id", orgId);
      if (error) throw error;
      toast.success("Organization settings updated");
      qc.invalidateQueries();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteOrg() {
    if (confirmName !== org.data?.name) return toast.error("Organization name mismatch");
    setDeleting(true);
    try {
      const { error } = await supabase.from("organizations").delete().eq("id", orgId!);
      if (error) throw error;
      toast.success("Workspace deleted");
      localStorage.removeItem("bp_current_org");
      qc.invalidateQueries();
      navigate({ to: "/app" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete organization");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Organization Settings"
        description="Manage workspace details, fiscal period defaults, regional preferences, and deletion safeguards."
      />
      <PageBody>
        <div className="space-y-8 max-w-4xl">
          {/* General Org Profile */}
          <section className="rounded-lg border border-border bg-card p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
              <Building2 className="h-4 w-4 text-primary" /> General Information
            </div>

            {!isAdmin && (
              <Alert className="mb-4">
                <AlertDescription>
                  Only admins and owners can modify workspace settings.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>
                    Organization Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    className="min-h-11"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isAdmin}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Industry</Label>
                  <Select value={industry} onValueChange={setIndustry} disabled={!isAdmin}>
                    <SelectTrigger className="min-h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology / SaaS">Technology / SaaS</SelectItem>
                      <SelectItem value="Financial Services">Financial Services</SelectItem>
                      <SelectItem value="Healthcare & Bio">Healthcare & Bio</SelectItem>
                      <SelectItem value="Retail & E-commerce">Retail & E-commerce</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Professional Services">Professional Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Company Size</Label>
                  <Select value={companySize} onValueChange={setCompanySize} disabled={!isAdmin}>
                    <SelectTrigger className="min-h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1 - 10 employees</SelectItem>
                      <SelectItem value="11-50">11 - 50 employees</SelectItem>
                      <SelectItem value="51-200">51 - 200 employees</SelectItem>
                      <SelectItem value="201-500">201 - 500 employees</SelectItem>
                      <SelectItem value="500+">500+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Logo Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      className="min-h-11 flex-1"
                      placeholder="https://company.com/logo.png"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      disabled={!isAdmin}
                    />
                    {logoUrl && (
                      <div className="h-11 w-11 rounded-md border border-border grid place-items-center bg-muted shrink-0 overflow-hidden">
                        <img
                          src={logoUrl}
                          alt="Logo"
                          className="h-full w-full object-cover"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="pt-2">
                  <Button
                    onClick={save}
                    disabled={saving || !name.trim()}
                    className="min-h-11 gap-2 font-semibold"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving Changes…" : "Save Workspace Changes"}
                  </Button>
                </div>
              )}
            </div>
          </section>

          {/* Fiscal & Regional Currency Controls */}
          <section className="rounded-lg border border-border bg-card p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
              <DollarSign className="h-4 w-4 text-emerald-500" /> Fiscal & Regional Preferences
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Fiscal Year Start Month</Label>
                <Select
                  value={fiscalYearStart}
                  onValueChange={setFiscalYearStart}
                  disabled={!isAdmin}
                >
                  <SelectTrigger className="min-h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="January">January (Calendar Year)</SelectItem>
                    <SelectItem value="April">April (UK / India Tax)</SelectItem>
                    <SelectItem value="July">July (Mid-Year Fiscal)</SelectItem>
                    <SelectItem value="October">October (US Govt Fiscal)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Base Currency</Label>
                <Select value={baseCurrency} onValueChange={setBaseCurrency} disabled={!isAdmin}>
                  <SelectTrigger className="min-h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD ($)">USD ($)</SelectItem>
                    <SelectItem value="EUR (€)">EUR (€)</SelectItem>
                    <SelectItem value="GBP (£)">GBP (£)</SelectItem>
                    <SelectItem value="NGN (₦)">NGN (₦)</SelectItem>
                    <SelectItem value="CAD ($)">CAD ($)</SelectItem>
                    <SelectItem value="AUD ($)">AUD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Number Formatting</Label>
                <Select value={numberFormat} onValueChange={setNumberFormat} disabled={!isAdmin}>
                  <SelectTrigger className="min-h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1,234.56">Standard (1,234.56)</SelectItem>
                    <SelectItem value="1.234,56">European (1.234,56)</SelectItem>
                    <SelectItem value="1 234,56">Space Separated (1 234,56)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Integrations */}
          <section className="rounded-lg border border-border p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">
                  Integrations & Connectors
                </h2>
                <p className="mt-2 max-w-prose text-sm text-muted-foreground">
                  Direct connectors for Salesforce, HubSpot, and QuickBooks are on the roadmap.
                </p>
              </div>
              <span className="shrink-0 self-start rounded-full border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Roadmap
              </span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {["Salesforce", "HubSpot", "QuickBooks"].map((p) => (
                <div
                  key={p}
                  className="flex items-center justify-between rounded-md border border-border p-4"
                >
                  <div className="flex items-center gap-3">
                    <LinkIcon className="h-4 w-4" />
                    <span className="font-medium">{p}</span>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Connect
                  </Button>
                </div>
              ))}
            </div>
          </section>

          {/* Danger Zone: Workspace Deletion Safeguard */}
          {isAdmin && (
            <section className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:p-6">
              <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-destructive font-semibold">
                <AlertTriangle className="h-4 w-4" /> Danger Zone
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Permanently delete this organization, along with all associated budgets, expenses,
                and invitations. This action cannot be undone.
              </p>
              <div className="mt-4">
                <Button
                  variant="destructive"
                  className="min-h-11 gap-2 font-semibold"
                  onClick={() => {
                    setConfirmName("");
                    setDeleteModalOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" /> Delete Organization Workspace
                </Button>
              </div>
            </section>
          )}
        </div>
      </PageBody>

      {/* Delete Safeguard Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive font-mono text-xs uppercase tracking-widest font-semibold mb-1">
              <AlertTriangle className="h-4 w-4" /> Irreversible Action
            </div>
            <DialogTitle className="text-xl font-bold text-destructive">
              Delete "{org.data?.name}"?
            </DialogTitle>
            <DialogDescription className="text-sm">
              All financial entries, department caps, and member records will be permanently
              removed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <p className="text-xs text-muted-foreground">
              To confirm, type{" "}
              <span className="font-mono font-bold text-foreground">{org.data?.name}</span> in the
              box below:
            </p>
            <Input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={org.data?.name}
              className="min-h-11 font-mono"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleting || confirmName !== org.data?.name}
              onClick={handleDeleteOrg}
              className="gap-2 font-semibold"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "Deleting Workspace…" : "Confirm Permanent Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
