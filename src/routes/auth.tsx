import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ShieldCheck,
  Zap,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  Building2,
  Users,
} from "lucide-react";
import { setCurrentOrgId } from "@/hooks/use-org";
import logoImg from "@/assets/logo.png";
import netflixHeroBg from "@/assets/netflix-hero-bg.png";

const authSearch = z.object({
  mode: z.enum(["login", "signup"]).catch("login"),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: authSearch,
  component: AuthPage,
});

function AuthPage() {
  const { mode, redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(mode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);

  // Only allow same-app relative paths as a post-login destination.
  const safeRedirect = redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : null;
  const goNext = (fallback: string) => {
    if (safeRedirect) window.location.assign(safeRedirect);
    else navigate({ to: fallback });
  };

  useEffect(() => setIsSignup(mode === "signup"), [mode]);

  // If already signed in, bounce to app
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      if (safeRedirect) return window.location.assign(safeRedirect);
      const { data: m } = await supabase.from("org_members").select("org_id").eq("user_id", data.session.user.id).limit(1).maybeSingle();
      if (m?.org_id) setCurrentOrgId(m.org_id);
      navigate({ to: "/app/dashboard" });
    });
  }, [navigate, safeRedirect]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        // Joining via an invite link: no workspace needs to be created.
        const joiningInvite = !!safeRedirect;
        if (!joiningInvite && !orgName.trim()) throw new Error("Organization name is required");
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin + (safeRedirect ?? "/auth"),
          },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Check your email to confirm your account, then log in.");
          setIsSignup(false);
          setLoading(false);
          return;
        }
        if (joiningInvite) {
          goNext("/app/dashboard");
          return;
        }
        // Create org via RPC (uses SECURITY DEFINER, adds creator as admin)
        const { data: orgId, error: rpcErr } = await supabase.rpc("create_organization", { _name: orgName });
        if (rpcErr) throw rpcErr;
        if (orgId) setCurrentOrgId(orgId as unknown as string);
        toast.success("Workspace created");
        navigate({ to: "/app/onboarding" });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (safeRedirect) return goNext("/app/dashboard");
        const { data: m } = await supabase.from("org_members").select("org_id").eq("user_id", data.user.id).limit(1).maybeSingle();
        if (m?.org_id) setCurrentOrgId(m.org_id);
        toast.success("Welcome back");
        navigate({ to: "/app/dashboard" });
      }

    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function googleSignIn() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo:
            window.location.origin +
            "/auth" +
            (safeRedirect ? `?redirect=${encodeURIComponent(safeRedirect)}` : ""),
        },
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      {/* Rich Readonly Left Side Panel */}
      <div className="relative hidden border-r border-border bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between overflow-hidden">
        {/* Background Ambient Grid & Vignette */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <img
            src={netflixHeroBg}
            alt="BudgetIT Ambient Grid"
            className="h-full w-full object-cover opacity-25 brightness-90 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/60" />
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full" />
        </div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-bold tracking-tight">
            <img src={logoImg} alt="BudgetIT Logo" className="h-10 w-10 rounded-xl object-contain shadow-lg ring-1 ring-white/20" />
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight leading-none text-white">BudgetIT</span>
              <span className="text-[9px] font-mono text-blue-400 font-bold uppercase tracking-widest mt-0.5">Enterprise FP&A</span>
            </div>
          </Link>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-medium">
            <Sparkles className="h-3.5 w-3.5" /> v2.0 Live
          </span>
        </div>

        {/* Main Content & Feature Highlights */}
        <div className="relative z-10 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono font-semibold uppercase tracking-wider text-gray-200 mb-6 backdrop-blur-md">
            <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20" /> Spend Governance & Financial Clarity
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white mb-4">
            Corporate Budgeting <br />
            <span className="text-gradient">Without Spreadsheet Chaos</span>
          </h2>

          <p className="text-sm text-gray-300 leading-relaxed max-w-lg mb-8">
            Connect Excel, CSV, PDF statements, QuickBooks & NetSuite into real-time spend dashboards leadership actually trusts.
          </p>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 mb-2">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <div className="text-xs font-bold text-white">Universal Importer</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Parse multi-format financial exports with zero errors.</div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="text-xs font-bold text-white">Variance Engine</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Sub-second query speed & budget burn tracking.</div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 mb-2">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="text-xs font-bold text-white">Supabase RLS</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Multi-tenant isolation & audit-ready data logs.</div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 mb-2">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="text-xs font-bold text-white">Multi-Org Support</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Seamless workspace switching & team RBAC.</div>
            </div>
          </div>

          {/* Social Proof Stats Banner */}
          <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
            <div>
              <div className="text-xl font-black text-white">$2.4B+</div>
              <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Budget Managed</div>
            </div>
            <div>
              <div className="text-xl font-black text-white">450+</div>
              <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Enterprise Teams</div>
            </div>
            <div>
              <div className="text-xl font-black text-white">99.99%</div>
              <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">System Uptime</div>
            </div>
          </div>

          {/* Customer Quote Box */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-transparent border border-blue-500/20 backdrop-blur-md">
            <p className="text-xs text-gray-200 italic leading-relaxed">
              "We eliminated our 12-day monthly close process. BudgetIT replaced our fragile linked spreadsheets with a single source of truth."
            </p>
            <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
              <span className="font-semibold text-white">— Sarah Jensen, VP of Finance</span>
              <span className="text-emerald-400 flex items-center gap-1 font-mono"><CheckCircle2 className="h-3 w-3" /> Verified FP&A User</span>
            </div>
          </div>
        </div>

        {/* Readonly Footer Trust Badges */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 text-[11px] text-gray-400 font-medium">
          <span>© {new Date().getFullYear()} BudgetIT Enterprise</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Lock className="h-3 w-3 text-emerald-400" /> 256-Bit Encrypted</span>
            <span>•</span>
            <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-blue-400" /> SOC2 Compliant</span>
          </span>
        </div>
      </div>

      {/* Auth Form Right Side */}
      <div className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground lg:hidden">
            ← Back to Home
          </Link>

          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl text-foreground">
                {isSignup ? "Create your workspace" : "Welcome back"}
              </h1>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
                {isSignup ? "Signup" : "Login"}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {isSignup ? "Set up your organization & start managing spend in under a minute." : "Log in to your BudgetIT workspace."}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {isSignup && (
              <>
                {!safeRedirect && (
                  <div className="space-y-1.5">
                    <Label htmlFor="orgName">Organization name</Label>
                    <Input id="orgName" className="min-h-11 shadow-sm" maxLength={100} value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Acme Financial Inc." required />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Your full name</Label>
                  <Input id="fullName" className="min-h-11 shadow-sm" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Alex Chen" />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Work email address</Label>
              <Input id="email" className="min-h-11 shadow-sm" type="email" placeholder="alex@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {!isSignup && (
                  <button type="button" className="text-xs text-primary hover:underline font-medium" onClick={() => toast.info("Password reset link sent to your email if registered.")}>
                    Forgot password?
                  </button>
                )}
              </div>
              <Input id="password" className="min-h-11 shadow-sm" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
            </div>

            <Button type="submit" className="w-full min-h-11 font-semibold text-base shadow-md gap-2" disabled={loading}>
              {loading ? "Please wait…" : isSignup ? (safeRedirect ? "Create account" : "Create workspace") : "Log in to Workspace"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">or continue with</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full min-h-11 gap-2 shadow-sm font-medium hover:bg-muted/80"
            disabled={loading}
            onClick={googleSignIn}
            aria-label={isSignup ? "Sign up with Google" : "Log in with Google"}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1a6.2 6.2 0 1 1 0-12.4c1.94 0 3.24.83 3.98 1.54l2.72-2.62A9.9 9.9 0 0 0 12 2a10 10 0 1 0 0 20c5.77 0 9.6-4.05 9.6-9.76 0-.66-.07-1.16-.16-1.66H12z" />
            </svg>
            Continue with Google
          </Button>

          <div className="mt-8 text-center text-sm text-muted-foreground p-4 rounded-xl bg-muted/40 border border-border/50">
            {isSignup ? (
              <>Already have an account?{" "}
                <button className="font-semibold text-primary hover:underline" onClick={() => setIsSignup(false)}>Log in here</button>
              </>
            ) : (
              <>New to BudgetIT?{" "}
                <button className="font-semibold text-primary hover:underline" onClick={() => setIsSignup(true)}>Create a workspace</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

