import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentation — BudgetIT" },
      { name: "description", content: "How BudgetIT works, getting started, and remix instructions." },
      { property: "og:title", content: "Documentation — BudgetIT" },
      { property: "og:description", content: "How BudgetIT works, getting started, and remix instructions." },
    ],
  }),
  component: DocsPage,
});

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border py-10 first:border-t-0 first:pt-0">
      <h2 className="text-xl font-black tracking-tight sm:text-2xl lg:text-3xl">{title}</h2>
      <div className="mt-4 max-w-prose space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {children}
      </div>
    </section>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-6 text-base font-semibold text-foreground sm:text-lg">{children}</h3>;
}

function DocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-5 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
            <div className="grid h-7 w-7 place-items-center rounded-sm bg-foreground text-background text-xs font-black">
              BP
            </div>
            <span className="text-lg">BudgetIT</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link to="/" className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline">Home</Link>
            <Link to="/auth" className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-accent">Log in</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <p className="mb-3 inline-block border border-border px-2 py-1 text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Documentation
        </p>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">BudgetIT docs</h1>
        <p className="mt-4 max-w-prose text-sm text-muted-foreground sm:text-base">
          Everything you need to use, operate, and remix this project. Written for three
          audiences: end users, the person setting it up, and anyone remixing it as a template.
        </p>

        {/* Table of contents */}
        <nav className="mt-8 rounded-lg border border-border p-5 text-sm">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Contents</div>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            <li><a href="#how" className="hover:underline">1. How it works</a></li>
            <li><a href="#getting-started" className="hover:underline">2. Getting started</a></li>
            <li><a href="#roles" className="hover:underline">3. Roles &amp; permissions</a></li>
            <li><a href="#import-export" className="hover:underline">4. Import &amp; export</a></li>
            <li><a href="#remix" className="hover:underline">5. Remixing this template</a></li>
            <li><a href="#gaps" className="hover:underline">6. Known gaps</a></li>
          </ul>
        </nav>

        <div className="mt-10">
          <Section id="how" title="1. How it works">
            <p>
              BudgetIT is a multi-tenant budget dashboard. Each account belongs to one or
              more <strong className="text-foreground">Organizations</strong> (workspaces).
              All budget data is scoped to an organization and isolated from every other
              organization via database row-level security.
            </p>
            <H3>Organizations</H3>
            <p>
              When you sign up you either create a new organization or join one by opening an
              invite link an admin shared with you. You can belong to more than one; the sidebar
              shows the currently active workspace.

            </p>
            <H3>Onboarding</H3>
            <p>
              First-time admins go through a 3-step flow: organization basics
              (industry, size), first data (import CSV or seed sample data), and
              inviting teammates. It runs once per org and is skippable — you can finish
              it later from the dashboard prompt.
            </p>
            <H3>Dashboard &amp; analytics</H3>
            <p>
              The dashboard summarizes total budgeted, spent, and variance for the current
              period. Analytics breaks the same data down by category, department, and
              period so you can spot overages fast.
            </p>
            <H3>Connect your system (roadmap)</H3>
            <p>
              Direct connectors for Salesforce, HubSpot, and QuickBooks are on the roadmap.
              Each user will authorize their own instance — BudgetIT won't ship a
              shared built-in connection. For now, use CSV import.
            </p>
          </Section>

          <Section id="getting-started" title="2. Getting started">
            <H3>Sign up</H3>
            <p>
              From the landing page click <strong className="text-foreground">Sign up</strong>.
              You can use email + password or "Continue with Google". Provide your name and
              an organization name; you become that organization's first admin.
            </p>
            <H3>Complete onboarding</H3>
            <p>
              You'll land on <code className="rounded bg-muted px-1 py-0.5 text-foreground">/app/onboarding</code>.
              Fill in industry and company size, then either import a CSV or seed sample data,
              then optionally invite teammates. When you finish, the workspace is marked as
              onboarded and you land on the dashboard.
            </p>
            <H3>Import your first data</H3>
            <p>
              Open <strong className="text-foreground">Import</strong> in the sidebar. Upload
              a CSV with columns for category, department, budgeted amount, actual amount,
              and period (e.g. <code className="rounded bg-muted px-1 py-0.5 text-foreground">2026-Q1</code>).
              Vendor and notes are optional.
            </p>
            <H3>Read the dashboard</H3>
            <p>
              After import, the dashboard shows top-level totals and variance for the current
              period. Analytics gives you department- and category-level breakdowns. Use
              Export to download a CSV of everything visible.
            </p>
          </Section>

          <Section id="roles" title="3. Roles & permissions">
            <p>
              Three roles, enforced at the database level:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li><strong className="text-foreground">Admin</strong> — full access, can invite/remove members, change roles, edit organization settings, and edit or delete any budget entry. The last admin cannot be demoted or removed.</li>
              <li><strong className="text-foreground">Member</strong> — can read every entry in their organization, create entries, and edit the entries they created; cannot edit other people's rows, delete entries, or manage teammates and settings.</li>
              <li><strong className="text-foreground">Viewer</strong> — read-only. Can view the dashboard, analytics, and export, but cannot import or change any data.</li>
            </ul>
            <p>
              Members and viewers do not see the Team or Settings pages, and viewers do not see
              Import. Server-side row-level security is the source of truth — the UI is filtered,
              but even a crafted request cannot escalate a member into admin-only tables or let a
              viewer write.
            </p>
          </Section>


          <Section id="import-export" title="4. Import & export">
            <H3>CSV import</H3>
            <p>
              Column headers are matched case-insensitively. Required: category, budgeted_amount,
              actual_amount, period. Optional: department, vendor, notes. Invalid rows are
              reported before commit; nothing is inserted until you confirm.
            </p>
            <H3>CSV export</H3>
            <p>
              The Export page downloads all budget entries for the current organization as
              a CSV file, filtered by the same period selector as the dashboard.
            </p>
          </Section>

          <Section id="remix" title="5. Remixing this template">
            <p>
              If you're remixing BudgetIT as a starting point for your own project, the
              short version:
            </p>
            <ol className="list-decimal space-y-2 pl-6">
              <li>
                <strong className="text-foreground">Rebrand.</strong> Rename the app in the
                landing page (<code className="rounded bg-muted px-1 py-0.5 text-foreground">src/routes/index.tsx</code>),
                the sidebar logo in <code className="rounded bg-muted px-1 py-0.5 text-foreground">src/routes/app.tsx</code>,
                and the head metadata in each route.
              </li>
              <li>
                <strong className="text-foreground">Backend.</strong> A remix creates a fresh
                Lovable Cloud backend for the new project — the original project's data,
                users, and secrets do <em>not</em> carry over. Migrations under
                <code className="rounded bg-muted px-1 py-0.5 text-foreground"> supabase/migrations/</code> re-run
                automatically against the new backend, which recreates the schema, RLS
                policies, and functions.
              </li>
              <li>
                <strong className="text-foreground">Google OAuth.</strong> The managed Google
                provider works out of the box in preview. If you configure your own Google
                Cloud OAuth credentials, they are per-project and must be redone for the
                remixed project's URL. See the README for the exact steps.
              </li>
              <li>
                <strong className="text-foreground">Verify.</strong> Sign up as a new user in
                the remixed project, confirm the onboarding flow gates correctly, and
                double-check RLS by trying to read another org's data from a second account.
              </li>
            </ol>
            <p>
              Full technical detail — schema, RLS, OAuth setup — lives in the
              <code className="rounded bg-muted px-1 py-0.5 text-foreground"> README.md </code>
              at the project root.
            </p>
          </Section>

          <Section id="gaps" title="6. Known gaps">
            <p>Things to be aware of before running this in production:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li><strong className="text-foreground">Email verification is disabled</strong> for faster testing (auto-confirm on). Turn it back on before production.</li>
              <li><strong className="text-foreground">Password reset flow is not built.</strong> Only the signup / login forms exist.</li>
              <li><strong className="text-foreground">Team invites don't send email.</strong> Creating an invite generates a single-use link (<code className="rounded bg-muted px-1 py-0.5 text-foreground">/accept-invite?token=…</code>) that you copy and send to the invitee yourself. It expires after 7 days, only works for the address it was issued to, and is redeemed after that person signs in with a confirmed email.</li>
              <li><strong className="text-foreground">No audit log</strong> of edits, deletes, or member changes.</li>
              <li><strong className="text-foreground">No legal pages</strong> — Terms and Privacy Policy are not included.</li>
            </ul>
          </Section>
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6">
          <div>© {new Date().getFullYear()} BudgetIT</div>
          <Link to="/" className="hover:text-foreground">← Back to home</Link>
        </div>
      </footer>
    </div>
  );
}
