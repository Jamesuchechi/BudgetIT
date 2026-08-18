import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { setCurrentOrgId } from "@/hooks/use-org";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const search = z.object({ token: z.string().optional() });

export const Route = createFileRoute("/accept-invite")({
  validateSearch: search,
  component: AcceptInvitePage,
  head: () => ({
    meta: [
      { title: "Accept your BudgetIT invite" },
      {
        name: "description",
        content: "Join a BudgetIT workspace using the invite link sent to your email.",
      },
      { property: "og:title", content: "Accept your BudgetIT invite" },
      {
        property: "og:description",
        content: "Join a BudgetIT workspace using the invite link sent to your email.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function messageFor(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("email not verified"))
    return "Confirm your email address first, then open this link again.";
  if (m.includes("different email"))
    return "This invite was sent to a different email address. Sign in with that address to accept it.";
  if (m.includes("invalid or expired"))
    return "This invite link is no longer valid — it may have expired or already been used. Ask an admin to send a new one.";
  if (m.includes("not authenticated")) return "You need to be signed in to accept this invite.";
  return raw;
}

function AcceptInvitePage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        setError("This invite link is missing its token. Ask an admin to resend the invite.");
        setWorking(false);
        return;
      }
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        const back = `/accept-invite?token=${encodeURIComponent(token)}`;
        window.location.assign(`/auth?redirect=${encodeURIComponent(back)}`);
        return;
      }
      const { data, error: rpcErr } = await supabase.rpc("accept_invite", { _token: token });
      if (cancelled) return;
      if (rpcErr) {
        setError(messageFor(rpcErr.message));
        setWorking(false);
        return;
      }
      if (data) setCurrentOrgId(data as unknown as string);
      toast.success("You've joined the workspace");
      navigate({ to: "/app/dashboard" });
    })();
    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-background p-6">
      <div className="w-full max-w-md rounded-lg border border-border p-6 text-center sm:p-8">
        <h1 className="text-2xl font-black tracking-tight">Accept invite</h1>
        {working ? (
          <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking your invite…
          </p>
        ) : (
          <>
            <p className="mt-4 text-sm text-muted-foreground">{error}</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild className="min-h-11">
                <Link to="/app/dashboard">Go to dashboard</Link>
              </Button>
              <Button asChild variant="outline" className="min-h-11">
                <Link to="/">Back to home</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
