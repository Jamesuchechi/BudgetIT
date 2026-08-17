# 📊 BudgetIT

**BudgetIT** is a real-time corporate budget management, expense tracking, and financial variance analysis platform. Designed for finance teams, department heads, and executives, BudgetIT provides clarity on spending, automates variance calculations, and prevents cost overruns across multi-tenant organization workspaces.

---

## ✨ Features

- 🏢 **Multi-Tenant Workspaces & RBAC**: Isolate financial data by organization with granular Role-Based Access Control (`Admin`, `Member`, `Viewer`).
- 💰 **Budget & Expense Management**: Track budgeted allocations vs. actual expenditures categorized by fiscal period, department, and expense category.
- 📉 **Real-Time Variance Analysis**: Automatic calculation of dollar ($) and percentage (%) variances with visual status indicators (**Under Budget**, **Near Limit**, **Over Budget**).
- 📊 **Interactive Analytics & Reporting**: Donut, bar, and trend charts powered by Recharts for instant spend distribution and historical trend visibility.
- 📁 **Smart CSV Import & Data Export**: Bulk import financial records via a flexible column-mapping wizard, and export custom reports to CSV/PDF.
- 👥 **Team Collaboration & Invitations**: Invite team members via secure email tokens with pre-assigned organizational roles.
- ⚡ **High Performance & Modern UX**: Built with TanStack Start & React 19 for fast server rendering, client-side caching, and responsive dark/light mode UI.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [TanStack Start](https://tanstack.com/router) + [React 19](https://react.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Build Tool** | [Vite 8](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) |
| **Icons & Charts** | [Lucide React](https://lucide.dev/) + [Recharts](https://recharts.org/) |
| **Backend & Auth** | [Supabase](https://supabase.com/) (PostgreSQL + Row-Level Security) |
| **Data Fetching** | [TanStack Query v5](https://tanstack.com/query) |

---

## 📁 Project Structure

```text
BudgetIT/
├── src/
│   ├── assets/              # Static media and design assets
│   ├── components/          # Reusable UI components & Radix primitives
│   │   ├── app/             # Application-specific UI layouts
│   │   └── ui/              # Atomized UI components (button, card, dialog, etc.)
│   ├── hooks/               # Custom React hooks (useBudgetEntries, useOrg, etc.)
│   ├── integrations/        # External integrations (Supabase client & types)
│   ├── lib/                 # Utilities, formatters, and CSV helpers
│   ├── routes/              # TanStack File-Based Router views
│   │   ├── __root.tsx       # Root application layout
│   │   ├── index.tsx        # Public landing page
│   │   ├── auth.tsx         # User login & registration
│   │   ├── app.tsx          # Authenticated app layout with sidebar
│   │   ├── app.dashboard.tsx# Main financial overview dashboard
│   │   ├── app.analytics.tsx# Deep-dive financial metrics & charts
│   │   ├── app.import.tsx   # Bulk CSV import wizard
│   │   ├── app.export.tsx   # Report generation and export
│   │   ├── app.team.tsx     # Team member management & invitations
│   │   └── app.settings.tsx # Organization settings
│   ├── server.ts            # Server entry point
│   ├── start.ts             # Application client entry
│   └── styles.css           # Global CSS & Tailwind configuration
├── supabase/                # Supabase database config and migrations
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite build configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your system:
- **Node.js**: `^20.19.0` or higher
- **npm** or **bun** package manager

### 1. Clone & Install Dependencies

```bash
git clone git@github.com:Jamesuchechi/BudgetIT.git
cd BudgetIT
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-supabase-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run Development Server

Start the Vite development server locally:

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173` (or the port allocated by Vite).

---

## 📜 Available Scripts

In the project directory, you can run:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the local Vite development server |
| `npm run build` | Builds the production server and client bundle |
| `npm run preview` | Previews the local production build |
| `npm run lint` | Runs ESLint to check for code issues |
| `npm run format` | Formats codebase using Prettier |

---

## 🔐 Security & Multi-Tenancy

BudgetIT enforces strict data isolation using Supabase **Row-Level Security (RLS)**:
- Users can only query or mutate budget entries associated with organizations they belong to (`is_org_member(org_id, auth.uid())`).
- Admin functions (such as inviting team members or changing org settings) are guarded by `has_org_role(org_id, 'admin', auth.uid())`.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
