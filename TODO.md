# 📌 BudgetIT — Master Technical Backlog & Feature Roadmap

This document serves as the master production roadmap, feature backlog, and operational task list for **BudgetIT**. It spans from prototype polish to enterprise-grade SaaS production readiness.

---

## 📋 Table of Contents
1. [Phase 1: Core Application Refinement & Design System](#-phase-1-core-application-refinement--design-system)
2. [Phase 2: Authentication, Authorization & Workspace Management](#-phase-2-authentication-authorization--workspace-management)
3. [Phase 3: Core Budgeting & Financial Engine](#-phase-3-core-budgeting--financial-engine)
4. [Phase 4: Smart Data Engine — CSV Import, Validation & Export](#-phase-4-smart-data-engine--csv-import-validation--export)
5. [Phase 5: Financial Analytics, Charts & Reporting Dashboard](#-phase-5-financial-analytics-charts--reporting-dashboard)
6. [Phase 6: Automated Alerts, Notifications & Approvals Workflow](#-phase-6-automated-alerts-notifications--approvals-workflow)
7. [Phase 7: AI Financial Insights & Run-Rate Forecasting](#-phase-7-ai-financial-insights--run-rate-forecasting)
8. [Phase 8: Enterprise Security, Compliance & Audit Logging](#-phase-8-enterprise-security-compliance--audit-logging)
9. [Phase 9: Mobile Experience, PWA & Accessibility](#-phase-9-mobile-experience-pwa--accessibility)
10. [Phase 10: DevOps, Testing & CI/CD Infrastructure](#-phase-10-devops-testing--cicd-infrastructure)

---

## 🎨 Phase 1: Core Application Refinement & Design System

### 1.1 Branding & UX Cleanup
- [x] Sweep through every route and component to ensure 100% consistent **BudgetIT** branding.
- [x] Remove all residual placeholder content, generic texts, and outdated mock links.
- [x] Update head meta tags, OpenGraph images, Twitter cards, and application favicons in `src/routes/__root.tsx`.
- [x] Implement a unified page header component with breadcrumbs, action buttons, and active workspace badges across all app screens.

### 1.2 Design Tokens & Theme Engine
- [x] Refine CSS custom properties in `src/styles.css` using dynamic HSL color spaces.
- [x] Ensure full dark/light theme parity with crisp contrast across all UI components.
- [x] Build a sleek Theme Toggle widget (Light, Dark, System Preference) in user profile and top header.
- [x] Add custom glassmorphism card variations with subtle backdrop-blur and border highlights for key summary widgets.
- [x] Add smooth framer-motion/CSS micro-animations for card hovers, modal overlays, dropdown expansions, and toast popups.

### 1.3 Atomized Component Library Enhancement
- [x] **Data Tables (`src/components/ui/table.tsx`)**:
  - [x] Sticky header support during long scrolling.
  - [x] Column sorting indicators with directional arrows.
  - [x] Multi-column density toggle (Compact, Default, Comfortable).
  - [x] Empty state illustrators for zero-data tables.
  - [x] Skeleton loaders for async data fetching states.
- [x] **Modal Dialogs & Sheets**:
  - [x] Lock background scroll when modals/sheets are active.
  - [x] Add keyboard `Escape` key close listeners and backdrop click handlers.
  - [x] Implement slide-over side sheets for deep item editing.
- [x] **Buttons & Interactive Elements**:
  - [x] Loading spinners inside action buttons during async form submissions.
  - [x] Confirmation dialog triggers for destructive actions (e.g. deleting a budget entry).
- [x] **Toasts & Feedback**:
  - [x] Standardize notification toasts using Sonner for success, warning, error, and info states.

### 1.4 Form Controls & Input Validation
- [x] Implement strict Zod schemas for all forms across the application.
- [x] Add currency input mask component supporting real-time thousand separators and currency symbol positioning.
- [x] Support multi-currency selection (`USD $`, `EUR €`, `GBP £`, `NGN ₦`, `CAD $`, `AUD $`) with configurable base org currency.
- [x] Date Range Picker component supporting presets (This Month, Last Month, This Quarter, YTD, Custom Range).
- [x] Vendor search & auto-complete input with memory of previously logged vendors.

---

## 🔐 Phase 2: Authentication, Authorization & Workspace Management

### 2.1 Supabase Auth Deep Integration
- [ ] Support passwordless Magic Link sign-in alongside standard Email/Password authentication.
- [ ] Implement Google and GitHub OAuth social login providers.
- [ ] Password reset flow with secure token verification and new password policy checks.
- [ ] Email verification banner for unverified user accounts.
- [ ] Session persistence, automatic token refresh, and idle auto-logout after inactivity.

### 2.2 Multi-Tenant Workspace Architecture
- [ ] **Organization Switcher UI**:
  - [ ] Top-left workspace dropdown displaying current organization logo and name.
  - [ ] Ability to switch between multiple organizations without re-authenticating.
  - [ ] Modal to create a new organization workspace.
- [ ] **Organization Settings (`src/routes/app.settings.tsx`)**:
  - [ ] Update organization name, industry, company size, and logo URL.
  - [ ] Select default fiscal year start month (January, April, July, October).
  - [ ] Define default base currency and number formatting preferences.
  - [ ] Organization deletion & data export safeguards for owners.

### 2.3 Role-Based Access Control (RBAC) Expansion
- [ ] Expand default database role ENUM (`app_role`):
  - [ ] `Owner`: Full org control, billing, deletion rights.
  - [ ] `Admin`: Full budget management, member management, settings access.
  - [ ] `Finance Manager`: Create/edit/delete budget entries, approve expenses, export reports.
  - [ ] `Department Lead`: Manage assigned department budgets, log expenses, view department analytics.
  - [ ] `Contributor`: Submit expense entries for approval.
  - [ ] `Viewer`: Read-only access to dashboards and analytics.
- [ ] Client-side permission guard hook (`useHasPermission('budget:create')`) to dynamically show/hide UI elements.
- [ ] Enforce database Row-Level Security (RLS) policies for every CRUD operation per role.

### 2.4 Team Collaboration & Invitations (`src/routes/app.team.tsx`)
- [ ] Invite team members via email with role selection dropdown.
- [ ] Resend or revoke pending invitation tokens.
- [ ] Custom invite expiration timer (e.g. 7 days).
- [ ] Bulk invite modal allowing CSV or comma-separated email input.
- [ ] Member directory table with search, role filter, status badges (Active, Pending), and action menu (Change Role, Remove Member).

---

## 💰 Phase 3: Core Budgeting & Financial Engine

### 3.1 Fiscal Period Management
- [ ] Multi-period support: Annual (FY2025, FY2026), Quarterly (Q1-Q4), and Monthly (Jan-Dec).
- [ ] Custom fiscal year offset configuration (e.g. FY starting April 1st for UK/India tax years).
- [ ] Budget rollover engine: Option to carry over unspent funds or budget deficits into the next period.
- [ ] Period Status Management: Mark periods as `Draft`, `Active`, `Closed`, or `Locked`.

### 3.2 Category & Department Structure
- [ ] Two-tier category hierarchy: Parent Categories (e.g. *Operating Expenses*) & Child Categories (e.g. *SaaS Subscriptions*, *Cloud Infrastructure*).
- [ ] Custom category color tagging and icon assignment for visual recognition.
- [ ] Department/Cost-Center management: Add, rename, archive departments (e.g. Engineering, Sales, Product, Ops, HR).
- [ ] Assign budget caps per department and sub-category.

### 3.3 Expense & Line-Item Tracking
- [ ] Add/Edit/Delete expense entries with fields:
  - `Title / Description`
  - `Amount`
  - `Date`
  - `Department`
  - `Category`
  - `Vendor`
  - `Payment Method` (Credit Card, Wire Transfer, Direct Debit, Petty Cash)
  - `Receipt Attachment` (Image/PDF upload)
  - `Notes / Reference Code`
- [ ] Mark expense status: `Planned`, `Pending Approval`, `Approved`, `Paid`.
- [ ] Support recurring expense templates (e.g. monthly AWS bill, quarterly software renewal).
- [ ] Support negative expense line items for refunds, rebates, or credits.

### 3.4 Financial Variance Engine
- [ ] Real-time calculation formulas:
  - $\text{Variance Amount} = \text{Budgeted Amount} - \text{Actual Amount}$
  - $\text{Spend Percentage} = \left( \frac{\text{Actual Amount}}{\text{Budgeted Amount}} \right) \times 100$
  - $\text{Remaining Cap} = \text{Budgeted Amount} - \text{Actual Amount}$
- [ ] Automated visual status badges:
  - 🟢 **Under Budget**: $< 80\%$ spent
  - 🟡 **Near Limit**: $80\% - 99.9\%$ spent
  - 🔴 **Over Budget**: $\ge 100\%$ spent
- [ ] Department-level and Category-level variance rollup summaries.

---

## 📥 Phase 4: Smart Data Engine — CSV Import, Validation & Export

### 4.1 Intelligent CSV Import Wizard (`src/routes/app.import.tsx`)
- [ ] Drag-and-drop CSV dropzone with file type and size checks.
- [ ] Support common CSV formats exported from QuickBooks, Xero, Stripe, Ramp, Brex, and Excel.
- [ ] Automatic column header fuzzy matching engine (e.g. mapping "Cost", "Price", "Amount" -> `amount`).
- [ ] Manual column mapping dropdown selector for unmapped headers.
- [ ] Save mapping templates for recurring imports.

### 4.2 Dry-Run Pre-Flight Validation Engine
- [ ] Parse and display a dry-run validation table before inserting records into database.
- [ ] Flag data errors inline:
  - Missing mandatory fields (Date, Category, Amount).
  - Invalid date formats (automatically parse ISO, MM/DD/YYYY, DD/MM/YYYY).
  - Non-numeric or negative amount values.
  - Unrecognized categories/departments (prompt to auto-create or remap).
  - Potential duplicate transactions based on date + vendor + amount.
- [ ] Ability to edit cell values inline inside the validation preview table.
- [ ] Batch commit progress bar with success summary report.

### 4.3 Flexible Data Export Engine (`src/routes/app.export.tsx`)
- [ ] Export filtered financial tables to CSV with custom delimiter selection (comma, semicolon).
- [ ] Export to formatted Microsoft Excel (`.xlsx`) spreadsheets with auto-formatted currencies and totals.
- [ ] Export to PDF Executive Report:
  - Clean printable layout with company logo, period header, KPI cards, and category breakdown table.
- [ ] Scheduled recurring exports delivered via email (Weekly/Monthly).

---

## 📈 Phase 5: Financial Analytics, Charts & Reporting Dashboard

### 5.1 Main Dashboard Enhancements (`src/routes/app.dashboard.tsx`)
- [ ] Top KPI Metric Cards:
  - **Total Budgeted**: Allocated sum for selected period.
  - **Total Spent**: Accumulated actual spend.
  - **Net Variance**: Remaining surplus or deficit.
  - **Burn Rate**: Average daily spend speed.
- [ ] Quick-action bar: New Expense, New Budget, Import CSV, Export Report.
- [ ] Interactive Period & Department Filter Bar.
- [ ] Top 5 Expensing Categories widget.
- [ ] Recent Transactions feed with direct view/edit action drawer.

### 5.2 Deep-Dive Analytics Page (`src/routes/app.analytics.tsx`)
- [ ] **Spend Trend Chart**: Line/Area chart comparing Budget vs. Actual over time (MoM, QoQ).
- [ ] **Category Breakdown**: Interactive Donut chart with hover tooltips and category percentage legend.
- [ ] **Department Comparison**: Stacked bar chart showing relative spend across all departments.
- [ ] **Vendor Concentration**: Horizontal bar chart highlighting top vendors by total dollar volume.
- [ ] **Variance Heatmap**: Color-coded matrix showing high-risk vs. healthy budget categories.

### 5.3 Custom Dashboard Layouts & Saved Views
- [ ] Drag-and-drop widget arrangement on dashboard.
- [ ] Widget visibility toggles (hide/show specific charts).
- [ ] Save custom filter combinations as "Saved Views" (e.g. "Q1 Tech Subscriptions", "Marketing YTD").

---

## 🔔 Phase 6: Automated Alerts, Notifications & Approvals Workflow

### 6.1 Threshold Notification System
- [ ] Configurable alert rules per organization (e.g. "Notify when any department exceeds 85% of budget").
- [ ] Custom threshold triggers (75%, 85%, 95%, 100%, 110%).
- [ ] In-app Notification Center widget in top navbar:
  - Unread notification count badge.
  - Mark as read / Clear all options.
  - Direct links from notification to offending budget category.

### 6.2 Multi-Channel Alert Delivery
- [ ] Email notifications using transactional email service (Resend / SendGrid).
- [ ] Slack Webhook Integration: Send instant budget alerts to a designated `#finance-alerts` channel.
- [ ] Microsoft Teams Webhook support for corporate teams.

### 6.3 Expense Approval Workflows
- [ ] Define expense approval threshold (e.g. expenses > $2,500 require approval).
- [ ] Pending Approvals queue for Finance Managers and Department Leads.
- [ ] One-click Approve or Reject with reason note.
- [ ] Email notification to submitter upon approval or rejection.

---

## 🤖 Phase 7: AI Financial Insights & Run-Rate Forecasting

### 7.1 Predictive Run-Rate & Velocity Engine
- [ ] Calculate daily spend velocity based on days elapsed in the current period.
- [ ] Projected End-of-Period Forecast:
  $$\text{Projected Spend} = \left( \frac{\text{Current Spend}}{\text{Days Elapsed}} \right) \times \text{Total Days in Period}$$
- [ ] Early Warning Banner on Dashboard: *"At current pace, Marketing will exceed Q3 budget by $5,400 on Day 22."*
- [ ] Seasonality adjustments for variable spend patterns (e.g. year-end hardware refreshes).

### 7.2 AI Budget Assistant & Automation
- [ ] **Receipt OCR Scanner**: Upload receipt image/PDF -> automatically extract Vendor, Date, Total Amount, and Tax using Firebase AI / Gemini API.
- [ ] **Smart Category Suggestion**: AI automatically suggests category for uncategorized CSV rows based on vendor name.
- [ ] **Anomaly Detection**: Highlight unusual transactions (e.g. "Vendor 'Acme Corp' charged $4,500 this month, 300% above 6-month average of $1,500").
- [ ] **Natural Language Query**: "Show me all software spend above $1,000 in Q2".

---

## 🛡️ Phase 8: Enterprise Security, Compliance & Audit Logging

### 8.1 Immutable Audit Log System
- [ ] Create dedicated `audit_logs` table in PostgreSQL schema.
- [ ] Log event details: `timestamp`, `actor_id`, `actor_email`, `action` (CREATE, UPDATE, DELETE, INITE, ROLE_CHANGE), `entity_type`, `entity_id`, `ip_address`, `changes_json`.
- [ ] Searchable Audit Trail UI page in Organization Settings for Admins and Auditors.
- [ ] Export audit log records for compliance audits.

### 8.2 Security Hardening & Compliance
- [ ] Enforce Row-Level Security (RLS) testing for all tables.
- [ ] Rate limiting on authentication and API routes.
- [ ] Input sanitization against XSS and SQL injection.
- [ ] Content Security Policy (CSP) headers in Vite/Nitro configuration.
- [ ] GDPR Data Deletion & Privacy Export endpoints for user profiles.

### 8.3 Enterprise SSO & User Provisioning
- [ ] SAML 2.0 Single Sign-On integration via Supabase Enterprise Auth.
- [ ] Okta, Azure AD / Microsoft Entra ID, and OneLogin SSO support.
- [ ] SCIM 2.0 user provisioning and automated deprovisioning when employees depart.

---

## 📱 Phase 9: Mobile Experience, PWA & Accessibility

### 9.1 Mobile-First UI Optimization
- [ ] Dynamic responsive layout adapting seamlessly from 320px mobile screens to 4K desktop displays.
- [ ] Touch-friendly tap target sizes (minimum 44x44px for buttons and inputs).
- [ ] Mobile bottom navigation bar for core screens (Dashboard, Expenses, Add New, Alerts, Profile).
- [ ] Swipeable data table rows on mobile with action triggers.

### 9.2 Progressive Web App (PWA) Capabilities
- [ ] Web App Manifest (`manifest.json`) with app icons, theme colors, and display mode settings.
- [ ] Offline support via Service Worker caching static assets.
- [ ] Offline expense queue: Log expenses offline and automatically sync when network connection restores.
- [ ] Mobile "Add to Home Screen" installation prompt.

### 9.3 Accessibility (WCAG 2.1 AA Compliance)
- [ ] Full keyboard navigation support across all interactive widgets and menus.
- [ ] Accessible ARIA roles, labels, and live regions for dynamic chart updates.
- [ ] Visible focus rings on all focused elements.
- [ ] Color contrast verification for text, icons, and chart elements in both light and dark modes.

---

## 🧪 Phase 10: DevOps, Testing & CI/CD Infrastructure

### 10.1 Automated Testing Suite
- [ ] **Unit Tests**: Test math utility functions (variance calculations, run rates, CSV parsers) using Vitest.
- [ ] **Component Tests**: Test UI components (cards, forms, selectors) using React Testing Library.
- [ ] **End-to-End (E2E) Tests**: Build Playwright automation suites testing:
  - User Signup & Organization Creation.
  - Adding a Budget Entry & Verifying Dashboard Variance Updates.
  - CSV File Upload & Parsing.
  - Inviting a Team Member.

### 10.2 CI/CD & Deployment Pipeline
- [ ] GitHub Actions workflow for pull requests:
  - Run `npm run lint` (ESLint check).
  - Run `npx tsc --noEmit` (TypeScript typecheck).
  - Run Vitest unit test suite.
  - Build preview artifact (`npm run build`).
- [ ] Staging and Production deployment pipeline via Vercel / Cloudflare Pages / Firebase App Hosting.
- [ ] Database migration safety checks and automated rollbacks.

### 10.3 Monitoring, Telemetry & Error Reporting
- [ ] Integration with Sentry for real-time error logging and stack trace capture.
- [ ] PostHog / Plausible integration for privacy-focused product analytics and feature usage tracking.
- [ ] Server latency and database query performance monitoring.

---

*Last Updated: August 2026 | BudgetIT Core Development Team*
