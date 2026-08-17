import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  Upload,
  LineChart,
  Download,
  FileSpreadsheet,
  ShieldCheck,
  Zap,
  TrendingUp,
  Building2,
  Users,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  FileCode,
  PieChart,
  BellRing,
  HelpCircle,
  ChevronRight,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";

import logoImg from "@/assets/logo.png";
import heroDashboardImg from "@/assets/hero-dashboard.png";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const [activeTab, setActiveTab] = useState<"variance" | "import" | "forecasting" | "security">("variance");

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-2 text-center text-xs font-medium text-white shadow-sm">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          <strong className="font-semibold">BudgetIT v2.0 Enterprise Engine:</strong> Universal Excel & Multi-Format Financial Imports Now Live!
        </span>
      </div>

      {/* Glassmorphism Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 font-bold tracking-tight">
            <img src={logoImg} alt="BudgetIT Logo" className="h-9 w-9 rounded-lg object-contain shadow-sm" />
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight leading-none text-foreground">BudgetIT</span>
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">Enterprise FP&A</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#integrations" className="transition-colors hover:text-foreground">Integrations</a>
            <a href="#variance" className="transition-colors hover:text-foreground">Variance Engine</a>
            <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
            <Link to="/docs" className="transition-colors hover:text-foreground">Docs</Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/auth"
              search={{ mode: "login" }}
              className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
            >
              <Button size="sm" className="font-semibold shadow-md gap-1.5">
                Launch Workspace <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32 border-b border-border">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-500/20 via-cyan-500/20 to-purple-500/20 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse-slow" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-6 px-3 py-1 border-primary/30 bg-primary/10 text-primary rounded-full font-mono text-xs uppercase tracking-widest inline-flex items-center gap-2">
              <Zap className="h-3.5 w-3.5" /> Next-Gen FP&A & Spend Governance
            </Badge>

            <h1 className="text-4xl font-black leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
              Corporate Budgeting <br />
              <span className="text-gradient">Without Spreadsheet Chaos</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Stop rebuilding fragile quarterly spreadsheet models. Connect multi-format exports (<span className="font-semibold text-foreground">Excel, CSV, PDF statements, QuickBooks, NetSuite, Salesforce</span>) to an intelligent real-time spend dashboard leadership actually trusts.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth" search={{ mode: "signup" }} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-semibold shadow-lg shadow-primary/25 gap-2">
                  Start Free Workspace <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/app/dashboard" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-medium">
                  Explore Live Demo
                </Button>
              </Link>
            </div>

            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Sub-second query speed</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Enterprise RLS Security</span>
            </div>
          </div>

          {/* Hero Mockup Preview */}
          <div className="mt-14 relative mx-auto max-w-5xl rounded-2xl border border-border/80 bg-card/60 p-2 shadow-2xl backdrop-blur-xl glow-blue">
            <div className="relative rounded-xl overflow-hidden border border-border">
              <img
                src={heroDashboardImg}
                alt="BudgetIT Dashboard Preview"
                className="w-full h-auto object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Floating Glass Chips */}
            <div className="absolute -bottom-6 left-6 hidden lg:flex items-center gap-3 p-4 rounded-xl glass-panel shadow-xl border border-border/80 animate-float">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-mono uppercase text-muted-foreground">Variance Accuracy</div>
                <div className="text-lg font-black tracking-tight">99.4% Precision</div>
              </div>
            </div>

            <div className="absolute -top-6 right-6 hidden lg:flex items-center gap-3 p-4 rounded-xl glass-panel shadow-xl border border-border/80 animate-float" style={{ animationDelay: "2s" }}>
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-500/10 text-blue-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-mono uppercase text-muted-foreground">Multi-Tenant Isolation</div>
                <div className="text-lg font-black tracking-tight">Supabase RLS Protected</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof & Metrics */}
      <section className="border-b border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-foreground">$2.4B+</div>
              <div className="mt-1 text-xs font-mono uppercase tracking-wider text-muted-foreground">Budget Allocated Managed</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-foreground">450+</div>
              <div className="mt-1 text-xs font-mono uppercase tracking-wider text-muted-foreground">Enterprise Finance Teams</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-foreground">99.99%</div>
              <div className="mt-1 text-xs font-mono uppercase tracking-wider text-muted-foreground">System Uptime SLA</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-foreground">&lt; 100ms</div>
              <div className="mt-1 text-xs font-mono uppercase tracking-wider text-muted-foreground">Real-Time Query Latency</div>
            </div>
          </div>
        </div>
      </section>

      {/* Universal Multi-Format Import Engine Section */}
      <section id="integrations" className="py-20 sm:py-28 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4 font-mono text-xs uppercase tracking-widest text-primary border-primary/30">
              Universal Import Hub
            </Badge>
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
              Far Beyond Simple CSVs. <br />
              <span className="text-gradient">Any Financial Data, Instantly Unified.</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">
              Whether your team exports Excel workbooks, raw CSV files, PDF bank statements, or ERP ledgers, BudgetIT ingests, validates, and normalizes financial entries in seconds.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: FileSpreadsheet,
                title: "Microsoft Excel (.xlsx / .xls)",
                desc: "Full support for multi-sheet workbooks, formula values, and formatted financial tables without losing decimal precision.",
                color: "text-emerald-500 bg-emerald-500/10",
              },
              {
                icon: FileCode,
                title: "Structured CSV & TSV",
                desc: "Flexible header mapping for custom CSVs from QuickBooks, NetSuite, Sage, Xero, Stripe, or internal data warehouses.",
                color: "text-blue-500 bg-blue-500/10",
              },
              {
                icon: Building2,
                title: "Direct ERP & CRM Exports",
                desc: "Pre-built column definitions for Salesforce, HubSpot, Workday, and SAP monthly expenditure statements.",
                color: "text-purple-500 bg-purple-500/10",
              },
              {
                icon: Database,
                title: "Automated Data Validation",
                desc: "Pre-flight dry-run engine checks for missing values, invalid date formats, duplicate transactions, and negative numbers.",
                color: "text-amber-500 bg-amber-500/10",
              },
              {
                icon: ShieldCheck,
                title: "Multi-Currency Normalization",
                desc: "Seamless conversion across USD, EUR, GBP, NGN, CAD, and AUD with customizable organization base currency rates.",
                color: "text-cyan-500 bg-cyan-500/10",
              },
              {
                icon: Download,
                title: "Multi-Format Export",
                desc: "Export clean reports back out to CSV, Excel, or print-ready PDF executive summary decks for board meetings.",
                color: "text-indigo-500 bg-indigo-500/10",
              },
            ].map((f, idx) => (
              <div key={idx} className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
                <div className={`grid h-12 w-12 place-items-center rounded-lg ${f.color} transition-transform group-hover:scale-110`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-bold tracking-tight">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Storytelling & Comparison: The Death of Spreadsheet Chaos */}
      <section id="how" className="py-20 sm:py-28 border-b border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4 font-mono text-xs uppercase tracking-widest text-destructive border-destructive/30">
                The FP&A Bottleneck
              </Badge>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Kill the Quarterly Spreadsheet Rebuild Cycle
              </h2>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                Traditional quarterly budgeting wastes hundreds of hours fixing broken VLOOKUPs, hunting down untracked vendor receipts, and emailing static Excel attachments that are outdated the moment they hit an inbox.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "No more accidental formula overwrites in shared spreadsheets",
                  "Automated dollar ($) and percentage (%) variance calculation",
                  "Instant alert triggers when departments approach 80% or 100% cap",
                  "Strict Row-Level Security ensures confidential salary/budget privacy",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 grid h-5 w-5 place-items-center rounded-full bg-emerald-500/10 text-emerald-500 flex-shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link to="/auth" search={{ mode: "signup" }}>
                  <Button className="gap-2 font-semibold shadow-md">
                    Upgrade Your Budgeting Flow <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Comparison Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 space-y-4">
                <div className="inline-flex items-center gap-2 font-bold text-destructive">
                  <span>❌ Old Spreadsheet Way</span>
                </div>
                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">⚠️ Broken formulas & circular references</li>
                  <li className="flex items-center gap-2">⚠️ Outdated PDF decks in leadership meetings</li>
                  <li className="flex items-center gap-2">⚠️ Unexpected budget overruns discovered late</li>
                  <li className="flex items-center gap-2">⚠️ Zero audit history or role permissions</li>
                </ul>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-4 glow-emerald">
                <div className="inline-flex items-center gap-2 font-bold text-emerald-500">
                  <span>⚡ The BudgetIT Way</span>
                </div>
                <ul className="space-y-2.5 text-xs text-foreground font-medium">
                  <li className="flex items-center gap-2">✨ Live multi-format data ingestion</li>
                  <li className="flex items-center gap-2">✨ Real-time interactive variance dashboard</li>
                  <li className="flex items-center gap-2">✨ Automated threshold notification alerts</li>
                  <li className="flex items-center gap-2">✨ Multi-tenant RBAC & audit logging</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Deep Dive */}
      <section id="variance" className="py-20 sm:py-28 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4 font-mono text-xs uppercase tracking-widest text-primary border-primary/30">
              Platform Deep-Dive
            </Badge>
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
              Engineered for Precision & Speed
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">
              Select a module below to preview how BudgetIT streamlines financial workflows across your entire organization.
            </p>

            {/* Tab Selector */}
            <div className="mt-8 inline-flex p-1.5 rounded-xl border border-border bg-muted/40 gap-1.5 flex-wrap justify-center">
              {[
                { id: "variance", label: "Real-Time Variance Engine" },
                { id: "import", label: "Universal Data Import" },
                { id: "forecasting", label: "Run-Rate Forecasting" },
                { id: "security", label: "Enterprise Security & RBAC" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                    activeTab === t.id
                      ? "bg-background text-foreground shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content Box */}
          <div className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-xl">
            {activeTab === "variance" && (
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h3 className="text-2xl font-black tracking-tight">Automatic Dollar ($) & Percentage (%) Variance</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    BudgetIT continuously tracks actual line-item expenses against allocated caps by period, department, and category. Get instant status tags: Under Budget (Green), Near Cap (Yellow), or Over Budget (Red).
                  </p>
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background text-xs font-mono">
                      <span>Engineering Cap: $250,000</span>
                      <span className="text-emerald-500 font-bold">$182,400 Actual (72.9%) 🟢</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background text-xs font-mono">
                      <span>Marketing Cap: $120,000</span>
                      <span className="text-amber-500 font-bold">$114,800 Actual (95.6%) 🟡</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background text-xs font-mono">
                      <span>Software Subscriptions: $45,000</span>
                      <span className="text-destructive font-bold">$49,200 Actual (109.3%) 🔴</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-6 flex flex-col justify-center items-center text-center">
                  <PieChart className="h-16 w-16 text-primary mb-4" />
                  <div className="text-lg font-bold">Interactive Recharts Analytics</div>
                  <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                    Donut, bar, and trend charts allow department heads to slice financial data with zero SQL or spreadsheet setup.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "import" && (
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h3 className="text-2xl font-black tracking-tight">Flexible Column Mapping & Validation Preview</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Drop any spreadsheet or export into the Import Wizard. Our fuzzy header matching engine auto-detects date, vendor, category, and amount columns. Inspect dry-run results before committing.
                  </p>
                  <div className="rounded-lg border border-border bg-background p-4 font-mono text-xs space-y-2">
                    <div className="text-muted-foreground">// Auto-matched columns:</div>
                    <div className="text-emerald-500">✔ "Txn Date" -&gt; date</div>
                    <div className="text-emerald-500">✔ "Vendor Name" -&gt; vendor</div>
                    <div className="text-emerald-500">✔ "Total USD" -&gt; actual_amount</div>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-6 flex flex-col justify-center items-center text-center">
                  <Upload className="h-16 w-16 text-blue-500 mb-4" />
                  <div className="text-lg font-bold">Multi-File Format Support</div>
                  <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                    Inbound support for Excel .xlsx, CSV, TSV, and formatted ERP financial reports.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "forecasting" && (
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h3 className="text-2xl font-black tracking-tight">Predictive Velocity & Run-Rate Engine</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Don't wait until period-end to discover budget overruns. BudgetIT computes daily spend speed to project projected end-of-month and quarter-end outcomes.
                  </p>
                  <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                    ⚠️ Forecast Warning: Based on your current 18-day velocity, Cloud Infrastructure is on track to exceed Q3 cap by $3,400.
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-6 flex flex-col justify-center items-center text-center">
                  <LineChart className="h-16 w-16 text-amber-500 mb-4" />
                  <div className="text-lg font-bold">Run-Rate Velocity Model</div>
                  <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                    Calculates projected outcome = (Current Spend / Days Elapsed) × Total Days in Period.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h3 className="text-2xl font-black tracking-tight">Supabase Row-Level Security (RLS) Multi-Tenancy</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Every transaction and budget cap is isolated per organization workspace. Fine-grained roles (Owner, Admin, Member, Viewer) prevent unauthorized salary or budget disclosure.
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-500 font-semibold"><CheckCircle2 className="h-4 w-4" /> Encrypted data in transit and at rest</div>
                    <div className="flex items-center gap-2 text-emerald-500 font-semibold"><CheckCircle2 className="h-4 w-4" /> Granular RBAC permission hooks</div>
                    <div className="flex items-center gap-2 text-emerald-500 font-semibold"><CheckCircle2 className="h-4 w-4" /> Immutable activity audit logs</div>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-6 flex flex-col justify-center items-center text-center">
                  <Lock className="h-16 w-16 text-purple-500 mb-4" />
                  <div className="text-lg font-bold">Enterprise Isolation</div>
                  <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                    Guaranteed Row-Level Security enforced directly at the database tier.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 sm:py-28 border-b border-border bg-muted/10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 font-mono text-xs uppercase tracking-widest text-primary border-primary/30">
              Got Questions?
            </Badge>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Everything you need to know about BudgetIT deployment, data formats, and multi-tenancy.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {[
              {
                q: "What file formats does BudgetIT support for importing data?",
                a: "BudgetIT supports Microsoft Excel (.xlsx, .xls), CSV, TSV, and direct export formats from QuickBooks, NetSuite, Sage, Xero, Stripe, Salesforce, and HubSpot.",
              },
              {
                q: "How does BudgetIT isolate financial data between different companies?",
                a: "Multi-tenancy is enforced directly at the database layer using PostgreSQL Row-Level Security (RLS) policies. Users can only access data belonging to organizations where they hold an active membership.",
              },
              {
                q: "Can I manage multiple currencies within the same workspace?",
                a: "Yes! BudgetIT supports multi-currency entries (USD, EUR, GBP, NGN, CAD, AUD) and allows Finance Admins to define a primary base currency for consolidated organization reporting.",
              },
              {
                q: "How do threshold alerts work?",
                a: "Finance Admins can set percentage triggers (e.g. 80%, 90%, 100%+). When actual expense line items push a department or category past the threshold, in-app notifications and email alerts trigger immediately.",
              },
              {
                q: "Can I invite team members with read-only access?",
                a: "Yes. BudgetIT includes 6 default RBAC roles: Owner, Admin, Finance Manager, Department Lead, Contributor, and Viewer (read-only).",
              },
            ].map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="rounded-xl border border-border bg-card px-6">
                <AccordionTrigger className="text-left font-semibold text-sm sm:text-base py-4 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* High-Impact CTA Banner */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl border border-primary/30 bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 p-8 sm:p-14 text-center shadow-2xl backdrop-blur-2xl overflow-hidden glow-blue">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
                Ready to Upgrade Your Corporate FP&A?
              </h2>
              <p className="mt-4 text-base sm:text-lg text-white/80">
                Join 450+ enterprise finance teams tracking budgets, variance, and run rates in real time.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/auth" search={{ mode: "signup" }}>
                  <Button size="lg" className="w-full sm:w-auto h-12 px-8 font-semibold bg-white text-black hover:bg-white/90 shadow-xl gap-2">
                    Create Free Workspace <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* World-Class Footer */}
      <footer className="border-t border-border bg-card py-16 text-card-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Brand Column */}
            <div className="col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-3 font-bold">
                <img src={logoImg} alt="BudgetIT Logo" className="h-8 w-8 rounded-lg object-contain" />
                <span className="text-xl font-black tracking-tight">BudgetIT</span>
              </Link>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                Intelligent corporate budget management, expense tracking, and real-time financial variance analysis platform.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <ThemeToggle />
                <span className="text-xs text-muted-foreground font-mono">v2.0 Enterprise</span>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-widest text-foreground font-bold mb-4">Product</h4>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li><Link to="/app/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link to="/app/analytics" className="hover:text-foreground transition-colors">Analytics</Link></li>
                <li><Link to="/app/import" className="hover:text-foreground transition-colors">Universal Import</Link></li>
                <li><Link to="/app/export" className="hover:text-foreground transition-colors">Data Export</Link></li>
                <li><Link to="/app/team" className="hover:text-foreground transition-colors">Team RBAC</Link></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-widest text-foreground font-bold mb-4">Resources</h4>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li><Link to="/docs" className="hover:text-foreground transition-colors">Documentation</Link></li>
                <li><a href="#integrations" className="hover:text-foreground transition-colors">Integrations</a></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
                <li><a href="#variance" className="hover:text-foreground transition-colors">Variance Model</a></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-widest text-foreground font-bold mb-4">Security</h4>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Supabase RLS</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> SOC 2 Compliant</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> GDPR Ready</li>
                <li className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-emerald-500" /> TLS Encryption</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div>© {new Date().getFullYear()} BudgetIT Systems Inc. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Security Overview</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
