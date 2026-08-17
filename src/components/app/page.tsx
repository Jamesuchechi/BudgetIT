import { ReactNode } from "react";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-6 lg:p-8">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-black tracking-tight sm:text-2xl lg:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center [&>*]:w-full sm:[&>*]:w-auto">{actions}</div>}
    </header>
  );
}

export function PageBody({ children }: { children: ReactNode }) {
  return <div className="p-4 sm:p-6 lg:p-8">{children}</div>;
}


export function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border p-5">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-10 text-center">
      <div className="text-lg font-semibold">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
