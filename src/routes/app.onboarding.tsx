import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentOrgId, useMemberships } from "@/hooks/use-org";
import { useQueryClient } from "@tanstack/react-query";
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
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Plus,
  Trash2,
  Upload,
  Sparkles,
  X,
} from "lucide-react";

export const Route = createFileRoute("/app/onboarding")({
  component: OnboardingPage,
});

const INDUSTRIES = [
  "Software / SaaS",
  "Financial Services",
  "Retail / E-commerce",
  "Healthcare",
  "Manufacturing",
  "Professional Services",
  "Non-profit",
  "Other",
];
const SIZES = ["1–10", "11–50", "51–200", "201–1,000", "1,000+"];

type Invitee = { email: string; role: "admin" | "member" };

function OnboardingPage() {
  const navigate = useNavigate();
  const orgId = useCurrentOrgId();
  const memberships = useMemberships();
  const qc = useQueryClient();
  const current = memberships.data?.find((m) => m.org_id === orgId);
  const isAdmin = current?.role === "admin";

  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");
  const [invitees, setInvitees] = useState<Invitee[]>([{ email: "", role: "member" }]);
  const [busy, setBusy] = useState(false);
  const [links, setLinks] = useState<{ email: string; link: string }[]>([]);

  async function copyLink(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Invite link copied");
    } catch {
      toast.error("Couldn't copy — select the link and copy it manually");
    }
  }

  useEffect(() => {
    if (current?.organizations?.name) setOrgName(current.organizations.name);
  }, [current?.organizations?.name]);

  // Load current org details
  useEffect(() => {
    if (!orgId) return;
    supabase
      .from("organizations")
      .select("industry, company_size")
      .eq("id", orgId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.industry) setIndustry(data.industry);
        if (data?.company_size) setSize(data.company_size);
      });
  }, [orgId]);

  if (memberships.isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg p-6 sm:p-10">
        <h1 className="text-2xl font-black tracking-tight">Nothing to set up here</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Onboarding is completed by a workspace admin. Head to the dashboard to get started.
        </p>
        <Button className="mt-6" onClick={() => navigate({ to: "/app/dashboard" })}>
          Go to dashboard
        </Button>
      </div>
    );
  }

  async function saveStep1() {
    if (!orgId) return;
    if (!orgName.trim()) return toast.error("Workspace name is required");
    setBusy(true);
    try {
      const { error } = await supabase
        .from("organizations")
        .update({ name: orgName.trim(), industry: industry || null, company_size: size || null })
        .eq("id", orgId);
      if (error) throw error;
      qc.invalidateQueries();
      setStep(2);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  async function useSampleData() {
    if (!orgId) return;
    setBusy(true);
    try {
      const { error } = await supabase.rpc("seed_sample_budget_entries", { _org: orgId });
      if (error) throw error;
      toast.success("Sample data added");
      qc.invalidateQueries();
      setStep(3);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to seed");
    } finally {
      setBusy(false);
    }
  }

  async function onCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !orgId) return;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    setBusy(true);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (res) => {
        try {
          const norm = (h: string) => h.toLowerCase().replace(/[^a-z]/g, "");
          const findCol = (headers: string[], needles: string[]) =>
            headers.find((h) => needles.some((n) => norm(h).includes(n)));
          const hdrs = res.meta.fields ?? [];
          const cat = findCol(hdrs, ["category", "account"]);
          const dep = findCol(hdrs, ["department", "dept", "costcenter"]);
          const bud = findCol(hdrs, ["budget"]);
          const act = findCol(hdrs, ["actual", "spend"]);
          const per = findCol(hdrs, ["period", "quarter", "month", "date"]);
          const ven = findCol(hdrs, ["vendor", "supplier"]);
          const not = findCol(hdrs, ["note", "memo", "comment"]);
          if (!cat || !dep || !bud || !act || !per) {
            toast.error(
              "CSV is missing a required column (category, department, budget, actual, period).",
            );
            setBusy(false);
            return;
          }
          const rows = res.data.map((r) => ({
            org_id: orgId,
            created_by: userData.user!.id,
            category: (r[cat] ?? "").trim() || "Uncategorized",
            department: (r[dep] ?? "").trim() || "General",
            budgeted_amount: parseFloat((r[bud] ?? "0").replace(/[^0-9.\-]/g, "")) || 0,
            actual_amount: parseFloat((r[act] ?? "0").replace(/[^0-9.\-]/g, "")) || 0,
            period: (r[per] ?? "").trim() || "unknown",
            vendor: ven ? (r[ven] ?? null) || null : null,
            notes: not ? (r[not] ?? null) || null : null,
          }));
          const { error } = await supabase.from("budget_entries").insert(rows);
          if (error) throw error;
          toast.success(`Imported ${rows.length} rows`);
          qc.invalidateQueries();
          setStep(3);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Import failed");
        } finally {
          setBusy(false);
        }
      },
      error: () => {
        toast.error("Failed to parse CSV");
        setBusy(false);
      },
    });
  }

  async function sendInvites() {
    if (!orgId) return;
    const valid = invitees.filter((i) => /.+@.+\..+/.test(i.email));
    if (valid.length === 0) return finish();
    setBusy(true);
    try {
      const { data, error } = await supabase
        .from("org_invites")
        .insert(
          valid.map((i) => ({ org_id: orgId, email: i.email.toLowerCase().trim(), role: i.role })),
        )
        .select("email, token");
      if (error) throw error;
      setLinks(
        (data ?? []).map((r) => ({
          email: r.email,
          link: `${window.location.origin}/accept-invite?token=${r.token}`,
        })),
      );
      toast.success(`Created ${valid.length} invite link${valid.length === 1 ? "" : "s"}`);
      setBusy(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to invite");
      setBusy(false);
    }
  }

  async function finish() {
    if (!orgId) return;
    setBusy(true);
    try {
      await supabase.rpc("complete_onboarding", { _org: orgId });
      // Full reload avoids any stale cache in the app shell's onboarding gate.
      window.location.assign("/app/dashboard");
    } finally {
      setBusy(false);
    }
  }

  const progress = (step / 3) * 100;

  return (
    <div className="mx-auto w-full max-w-2xl p-4 sm:p-8">
      {/* Progress */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Step {step} of 3
          </div>
          <div
            className="mt-2 h-1 w-full rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={step}
            aria-valuemin={1}
            aria-valuemax={3}
          >
            <div
              className="h-full rounded-full bg-foreground transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={finish}
          disabled={busy}
          aria-label="Exit onboarding and go to dashboard"
          className="shrink-0"
        >
          <X className="h-4 w-4" /> Exit
        </Button>
      </div>

      {step === 1 && (
        <section className="rounded-lg border border-border p-5 sm:p-8">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Workspace basics</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This helps us tailor default categories and views.
          </p>
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="orgName">Workspace name</Label>
              <Input
                id="orgName"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="industry">Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((i) => (
                    <SelectItem key={i} value={i}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="size">Company size</Label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger id="size">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {SIZES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s} employees
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button variant="ghost" onClick={finish} disabled={busy}>
              Skip setup
            </Button>
            <Button onClick={saveStep1} disabled={busy} className="min-h-11">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="rounded-lg border border-border p-5 sm:p-8">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            Bring in your budget data
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload a CSV now, or explore with sample data. You can always import more later.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <label className="grid cursor-pointer place-items-center rounded-lg border border-dashed border-border p-6 text-center hover:bg-accent/40">
              <Upload className="mb-3 h-6 w-6" />
              <div className="font-semibold">Upload CSV</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Auto-mapped from common column names
              </div>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={onCsv}
                disabled={busy}
                aria-label="Upload budget CSV"
              />
            </label>
            <button
              onClick={useSampleData}
              disabled={busy}
              className="grid place-items-center rounded-lg border border-border p-6 text-center hover:bg-accent/40 disabled:opacity-50"
            >
              <Sparkles className="mb-3 h-6 w-6" />
              <div className="font-semibold">Use sample data</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Realistic entries across a few quarters
              </div>
            </button>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button variant="ghost" onClick={() => setStep(1)} disabled={busy}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={() => setStep(3)} disabled={busy}>
                Skip for now
              </Button>
              <Button variant="ghost" onClick={finish} disabled={busy}>
                Skip setup
              </Button>
            </div>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="rounded-lg border border-border p-5 sm:p-8">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Invite your team</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create invite links and share them yourself — links expire in 7 days and only work for
            the invited email. Skip if you want to do this later.
          </p>

          <div className="mt-6 space-y-3">
            {invitees.map((inv, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_140px_auto]"
              >
                <div className="col-span-2 sm:col-span-1">
                  <Label htmlFor={`invite-email-${idx}`} className="sr-only">
                    Email
                  </Label>
                  <Input
                    id={`invite-email-${idx}`}
                    type="email"
                    placeholder="teammate@company.com"
                    value={inv.email}
                    onChange={(e) =>
                      setInvitees((arr) =>
                        arr.map((x, i) => (i === idx ? { ...x, email: e.target.value } : x)),
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor={`invite-role-${idx}`} className="sr-only">
                    Role
                  </Label>
                  <Select
                    value={inv.role}
                    onValueChange={(v) =>
                      setInvitees((arr) =>
                        arr.map((x, i) =>
                          i === idx ? { ...x, role: v as "admin" | "member" } : x,
                        ),
                      )
                    }
                  >
                    <SelectTrigger id={`invite-role-${idx}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove invitee"
                  className="min-h-11 min-w-11"
                  onClick={() =>
                    setInvitees((arr) =>
                      arr.length > 1
                        ? arr.filter((_, i) => i !== idx)
                        : [{ email: "", role: "member" }],
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInvitees((arr) => [...arr, { email: "", role: "member" }])}
            >
              <Plus className="h-4 w-4" /> Add another
            </Button>
          </div>

          {links.length > 0 && (
            <div className="mt-6 rounded-lg border border-border p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Share these links
              </div>
              <ul className="mt-3 space-y-3">
                {links.map((l) => (
                  <li key={l.link} className="space-y-2">
                    <div className="truncate text-sm font-medium">{l.email}</div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <code className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-2 text-xs">
                        {l.link}
                      </code>
                      <Button
                        variant="outline"
                        className="min-h-11 w-full sm:w-auto"
                        onClick={() => copyLink(l.link)}
                      >
                        <Copy className="h-4 w-4" /> Copy
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                Links expire in 7 days and only work for the invited email address.
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button variant="ghost" onClick={() => setStep(2)} disabled={busy}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={finish} disabled={busy}>
                Skip
              </Button>
              {links.length > 0 ? (
                <Button onClick={finish} disabled={busy} className="min-h-11">
                  <Check className="h-4 w-4" /> Done
                </Button>
              ) : (
                <Button onClick={sendInvites} disabled={busy} className="min-h-11">
                  <Check className="h-4 w-4" /> Create invite links
                </Button>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
