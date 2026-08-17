import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, Upload, LineChart, Download, FileSpreadsheet, Activity } from "lucide-react";
import heroBg from "@/assets/hero-bw.jpg";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border bg-foreground text-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
            <div className="grid h-7 w-7 place-items-center rounded-sm bg-background text-foreground">
              <Activity className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <span className="text-lg">BudgetIT</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              search={{ mode: "login" }}
              className="text-sm font-medium hover:underline"
            >
              Sign In
            </Link>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="inline-flex items-center justify-center rounded-md bg-background px-3.5 py-1.5 text-sm font-semibold text-foreground hover:bg-background/90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>


      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/65 to-black/45" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:py-28">
          <div className="max-w-3xl">
            <p className="mb-4 inline-block border border-white/20 bg-white/10 px-2 py-1 text-xs font-mono uppercase tracking-widest text-white/70">
              For finance & FP&A teams
            </p>
            <h1 className="text-3xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Budget reporting that doesn't eat your quarter
            </h1>
            <p className="mt-6 text-base text-white/80 sm:text-lg lg:text-xl">
              Upload the CSV you already export from QuickBooks, NetSuite, Salesforce or HubSpot,
              and send leadership a live link instead of another screenshot in a deck. Budget vs.
              actual by category, department and period — updated the second you hit import.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-medium text-black hover:bg-white/90 sm:w-auto min-h-11"
              >
                Start now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>


        </div>
      </section>


      {/* How it works */}
      <section id="how" className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">How it works</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Four steps from raw finance export to a shareable live view.
          </p>
          <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: FileSpreadsheet, n: "01", t: "Export from your tool", d: "Pull a CSV from QuickBooks, NetSuite, Salesforce, HubSpot, or any spreadsheet." },
              { icon: Upload, n: "02", t: "Import & map columns", d: "Drop the CSV in. Map headers if they don't match the template — takes seconds." },
              { icon: LineChart, n: "03", t: "Open the live dashboard", d: "Budget vs. actual by department, category, period. Trends, variance, top overspend." },
              { icon: Download, n: "04", t: "Share or roll up", d: "Send leadership a link, or export a rolled-up CSV for the board deck." },
            ].map((s) => (
              <div key={s.n} className="bg-background p-6">
                <div className="flex items-center justify-between">
                  <s.icon className="h-5 w-5" />
                  <span className="font-mono text-xs text-muted-foreground">{s.n}</span>
                </div>
                <div className="mt-6 font-semibold">{s.t}</div>
                <div className="mt-2 text-sm text-muted-foreground">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">FAQ</h2>
          <Accordion type="single" collapsible className="mt-8">
            <AccordionItem value="1">
              <AccordionTrigger>How is my finance data secured?</AccordionTrigger>
              <AccordionContent>
                Data is stored per-organization with row-level security enforced at the database — no user or workspace
                can query another organization's data, even if the client asks for it. Every request is scoped by your
                signed-in session. Transport is TLS; passwords are hashed and checked against known-breach lists.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="2">
              <AccordionTrigger>Which finance / CRM sources can I import from?</AccordionTrigger>
              <AccordionContent>
                Anything that exports CSV. That covers QuickBooks, NetSuite, Xero, Sage Intacct, Salesforce and HubSpot
                (for pipeline / commit-based revenue), and every planning spreadsheet in the wild. If your headers
                don't match our template, use the column-mapping step.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="3">
              <AccordionTrigger>Can I invite my team? Different roles?</AccordionTrigger>
              <AccordionContent>
                Yes. Every workspace has Admins (manage users, org settings, delete data) and Members (view, import,
                add entries). Invite by email from the Team page. A Viewer role and finer-grained permissions are on
                the roadmap.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="4">
              <AccordionTrigger>Can I connect my QuickBooks / NetSuite / Salesforce directly?</AccordionTrigger>
              <AccordionContent>
                Today it's CSV import and export — deliberately simple, works with any tool, no IT ticket. Direct
                connectors (Salesforce, HubSpot, QuickBooks) where each user authorizes their own instance are on
                the roadmap; a placeholder for those lives in Settings.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="5">
              <AccordionTrigger>What does the CSV template look like?</AccordionTrigger>
              <AccordionContent>
                Columns: <span className="font-mono">Category</span>, <span className="font-mono">Department</span>,{" "}
                <span className="font-mono">Budgeted Amount</span>, <span className="font-mono">Actual Spend</span>,{" "}
                <span className="font-mono">Period</span> (e.g. 2026-Q1), <span className="font-mono">Vendor</span>{" "}
                (optional), <span className="font-mono">Notes</span> (optional). Download from the Import page.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="rounded-lg border border-border bg-foreground p-6 text-background sm:p-10 lg:p-14">
            <h3 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
              Stop rebuilding the model. Start sharing the link.
            </h3>
            <div className="mt-8">
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-background px-5 py-3 text-sm font-medium text-foreground hover:opacity-90 sm:w-auto min-h-11"
              >
                Create your workspace <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>


      <footer>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:justify-between sm:px-6 sm:text-left">
          <div>© {new Date().getFullYear()} BudgetIT</div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
            <Link to="/docs" className="hover:text-foreground">Docs</Link>
            <span>A spend / budget dashboard template.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
