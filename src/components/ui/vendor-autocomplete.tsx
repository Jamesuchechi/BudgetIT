import * as React from "react";
import { Check, ChevronsUpDown, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const DEFAULT_VENDORS = [
  "AWS Cloud Infrastructure",
  "Google Cloud Platform",
  "Microsoft Azure",
  "Salesforce Enterprise",
  "Slack Technologies",
  "Zoom Video Communications",
  "HubSpot Inc.",
  "Datadog Inc.",
  "Snowflake Data",
  "Atlassian Jira/Confluence",
  "Figma Inc.",
  "GitHub Enterprise",
  "Stripe Payments",
  "Twilio Inc.",
  "Vercel Inc.",
];

interface VendorAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  customVendors?: string[];
  placeholder?: string;
  className?: string;
}

export const VendorAutocomplete: React.FC<VendorAutocompleteProps> = ({
  value,
  onChange,
  customVendors = [],
  placeholder = "Select or type vendor...",
  className,
}) => {
  const [open, setOpen] = React.useState(false);
  const [inputVal, setInputVal] = React.useState(value || "");

  // Merge default & custom vendors uniquely
  const allVendors = React.useMemo(() => {
    const list = Array.from(new Set([...customVendors, ...DEFAULT_VENDORS]));
    return list.sort();
  }, [customVendors]);

  React.useEffect(() => {
    setInputVal(value || "");
  }, [value]);

  const handleSelect = (vendor: string) => {
    onChange(vendor);
    setInputVal(vendor);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-9 px-3 text-xs font-normal text-left", className)}
        >
          <span className="flex items-center gap-2 truncate">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span
              className={cn(inputVal ? "text-foreground font-medium" : "text-muted-foreground")}
            >
              {inputVal || placeholder}
            </span>
          </span>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search or type vendor name..."
            value={inputVal}
            onValueChange={(val) => {
              setInputVal(val);
              onChange(val);
            }}
          />
          <CommandList>
            <CommandEmpty className="p-2 text-xs text-muted-foreground">
              No matching vendor. Using "{inputVal}" as new vendor.
            </CommandEmpty>
            <CommandGroup heading="Recognized Vendors">
              {allVendors.map((vendor) => (
                <CommandItem
                  key={vendor}
                  value={vendor}
                  onSelect={() => handleSelect(vendor)}
                  className="text-xs flex items-center justify-between"
                >
                  <span>{vendor}</span>
                  {value === vendor && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
