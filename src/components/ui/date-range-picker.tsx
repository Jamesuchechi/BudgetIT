import * as React from "react";
import { CalendarIcon, ChevronDown } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DateRange {
  from: Date;
  to: Date;
}

export type PresetOption =
  "this-month" | "last-month" | "this-quarter" | "ytd" | "all-time" | "custom";

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange, className }) => {
  const [selectedPreset, setSelectedPreset] = React.useState<PresetOption>("this-month");

  const applyPreset = (preset: PresetOption) => {
    const now = new Date();
    let range: DateRange;

    switch (preset) {
      case "this-month":
        range = { from: startOfMonth(now), to: endOfMonth(now) };
        break;
      case "last-month": {
        const lastM = subMonths(now, 1);
        range = { from: startOfMonth(lastM), to: endOfMonth(lastM) };
        break;
      }
      case "this-quarter":
        range = { from: startOfQuarter(now), to: endOfQuarter(now) };
        break;
      case "ytd":
        range = { from: startOfYear(now), to: now };
        break;
      case "all-time":
        range = { from: new Date(2020, 0, 1), to: now };
        break;
      default:
        return;
    }

    setSelectedPreset(preset);
    onChange(range);
  };

  const getPresetLabel = () => {
    switch (selectedPreset) {
      case "this-month":
        return "This Month";
      case "last-month":
        return "Last Month";
      case "this-quarter":
        return "This Quarter";
      case "ytd":
        return "Year to Date (YTD)";
      case "all-time":
        return "All Time";
      default:
        return "Custom Range";
    }
  };

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 font-medium text-xs justify-between min-w-[240px]"
          >
            <span className="flex items-center gap-2 text-foreground">
              <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                {format(value.from, "MMM d, yyyy")} - {format(value.to, "MMM d, yyyy")}
              </span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="start">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1 mb-1">
            Quick Date Presets
          </div>
          <div className="space-y-1">
            {[
              { id: "this-month", label: "This Month" },
              { id: "last-month", label: "Last Month" },
              { id: "this-quarter", label: "This Quarter" },
              { id: "ytd", label: "Year to Date (YTD)" },
              { id: "all-time", label: "All Time" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id as PresetOption)}
                className={cn(
                  "w-full text-left px-2 py-1.5 rounded text-xs transition-colors hover:bg-muted",
                  selectedPreset === p.id && "bg-primary/10 text-primary font-semibold",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
