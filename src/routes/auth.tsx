import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Activity } from "lucide-react";
import { setCurrentOrgId } from "@/hooks/use-org";
import { lovable } from "@/integrations/lovable/index";

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
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri:
          window.location.origin +
          "/auth" +
          (safeRedirect ? `?redirect=${encodeURIComponent(safeRedirect)}` : ""),
      });
      if (result.error) throw result.error;
      if (result.redirected) return; // browser is navigating
      // Popup path: session already set by the helper. Route based on membership.
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Sign-in did not complete");
      if (safeRedirect) return goNext("/app/dashboard");

      const { data: m } = await supabase
        .from("org_members")
        .select("org_id")
        .eq("user_id", userData.user.id)
        .limit(1)
        .maybeSingle();
      if (m?.org_id) {
        setCurrentOrgId(m.org_id);
        navigate({ to: "/app/dashboard" });
      } else {
        // No org yet — app shell will show the "create workspace" state,
        // then push into onboarding after the org is created.
        navigate({ to: "/app/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="hidden border-r border-border bg-foreground p-10 text-background lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <div className="grid h-7 w-7 place-items-center rounded-sm bg-background text-foreground ">
            <Activity className="h-4 w-4" strokeWidth={2.5} />
          </div>
          BudgetIT
        </Link>
        <div>
          <p className="text-3xl font-black leading-tight tracking-tight">
            "We stopped rebuilding the model every quarter. The link just… works."
          </p>
          <p className="mt-4 text-sm opacity-70">— Every FP&A lead who tried it.</p>
        </div>
        <div className="text-xs opacity-60">© {new Date().getFullYear()} BudgetIT</div>
      </div>
      <div className="flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground lg:hidden">
            ← Back
          </Link>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{isSignup ? "Create your workspace" : "Welcome back"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isSignup ? "Set up your organization in under a minute." : "Log in to your BudgetIT workspace."}
          </p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            {isSignup && (
              <>
                {!safeRedirect && (
                  <div className="space-y-1.5">
                    <Label htmlFor="orgName">Organization name</Label>
                    <Input id="orgName" className="min-h-11" maxLength={100} value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Acme Inc." required />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Your name</Label>
                  <Input id="fullName" className="min-h-11" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Alex Chen" />
                </div>
              </>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" className="min-h-11" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" className="min-h-11" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
            </div>
            <Button type="submit" className="w-full min-h-11" disabled={loading}>
              {loading ? "Please wait…" : isSignup ? (safeRedirect ? "Create account" : "Create workspace") : "Log in"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full min-h-11"
            disabled={loading}
            onClick={googleSignIn}
            aria-label={isSignup ? "Sign up with Google" : "Log in with Google"}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1a6.2 6.2 0 1 1 0-12.4c1.94 0 3.24.83 3.98 1.54l2.72-2.62A9.9 9.9 0 0 0 12 2a10 10 0 1 0 0 20c5.77 0 9.6-4.05 9.6-9.76 0-.66-.07-1.16-.16-1.66H12z" />
            </svg>
            Continue with Google
          </Button>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isSignup ? (
              <>Already have an account?{" "}
                <button className="font-medium text-foreground underline" onClick={() => setIsSignup(false)}>Log in</button>
              </>
            ) : (
              <>New to BudgetIT?{" "}
                <button className="font-medium text-foreground underline" onClick={() => setIsSignup(true)}>Create workspace</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
