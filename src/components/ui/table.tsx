import * as React from "react";
import { ArrowUp, ArrowDown, ArrowUpDown, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  ),
);
Table.displayName = "Table";

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  sticky?: boolean;
}

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, sticky = false, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn(
        "[&_tr]:border-b",
        sticky && "sticky top-0 z-20 bg-background/95 backdrop-blur-md shadow-xs",
        className,
      )}
      {...props}
    />
  ),
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  density?: "compact" | "default" | "comfortable";
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, density = "default", ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        density === "compact" && "h-8 text-xs",
        density === "comfortable" && "h-14 text-base",
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  density?: "compact" | "default" | "comfortable";
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, density = "default", ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-10 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        density === "compact" && "h-8 px-2 text-xs",
        density === "comfortable" && "h-12 px-4 text-sm font-semibold",
        className,
      )}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  density?: "compact" | "default" | "comfortable";
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, density = "default", ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        "p-3 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        density === "compact" && "p-1.5 text-xs",
        density === "comfortable" && "p-4 text-sm",
        className,
      )}
      {...props}
    />
  ),
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
));
TableCaption.displayName = "TableCaption";

/* Column Header Component with Sorting Indicators */
interface DataTableColumnHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  sortDirection?: "asc" | "desc" | false;
  onSort?: () => void;
}

const DataTableColumnHeader: React.FC<DataTableColumnHeaderProps> = ({
  title,
  sortDirection,
  onSort,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 cursor-pointer select-none group font-semibold text-foreground/80 hover:text-foreground",
        className,
      )}
      onClick={onSort}
      {...props}
    >
      <span>{title}</span>
      {sortDirection === "asc" ? (
        <ArrowUp className="h-3.5 w-3.5 text-primary" />
      ) : sortDirection === "desc" ? (
        <ArrowDown className="h-3.5 w-3.5 text-primary" />
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
      )}
    </div>
  );
};

/* Empty State Helper Component */
interface DataTableEmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const DataTableEmptyState: React.FC<DataTableEmptyStateProps> = ({
  icon = <Inbox className="h-10 w-10 text-muted-foreground/60" />,
  title = "No data found",
  description = "No items match your query or filter criteria.",
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center my-4 border border-dashed rounded-xl bg-muted/20">
      <div className="mb-3 p-3 rounded-full bg-muted/60">{icon}</div>
      <h4 className="text-base font-bold text-foreground">{title}</h4>
      <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">{description}</p>
      {action}
    </div>
  );
};

/* Table Skeleton Loader Component */
interface DataTableSkeletonProps {
  rows?: number;
  columns?: number;
}

const DataTableSkeleton: React.FC<DataTableSkeletonProps> = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="w-full space-y-3 p-4">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center gap-4 animate-pulse">
          {Array.from({ length: columns }).map((_, cIdx) => (
            <div
              key={cIdx}
              className="h-8 rounded bg-muted/60 flex-1"
              style={{ opacity: 1 - rIdx * 0.15 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  DataTableColumnHeader,
  DataTableEmptyState,
  DataTableSkeleton,
};
