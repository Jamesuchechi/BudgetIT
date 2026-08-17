import * as React from "react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "NGN" | "CAD" | "AUD";

export const CURRENCY_MAP: Record<CurrencyCode, { symbol: string; label: string; name: string }> = {
  USD: { symbol: "$", label: "USD ($)", name: "US Dollar" },
  EUR: { symbol: "€", label: "EUR (€)", name: "Euro" },
  GBP: { symbol: "£", label: "GBP (£)", name: "British Pound" },
  NGN: { symbol: "₦", label: "NGN (₦)", name: "Nigerian Naira" },
  CAD: { symbol: "CAD $", label: "CAD ($)", name: "Canadian Dollar" },
  AUD: { symbol: "AUD $", label: "AUD ($)", name: "Australian Dollar" },
};

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: number | string;
  onChange: (value: number) => void;
  currency?: CurrencyCode;
  onCurrencyChange?: (currency: CurrencyCode) => void;
  showCurrencySelector?: boolean;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      className,
      value,
      onChange,
      currency = "USD",
      onCurrencyChange,
      showCurrencySelector = true,
      disabled,
      placeholder = "0.00",
      ...props
    },
    ref
  ) => {
    // Format numeric value with thousand separators
    const formatDisplay = (numVal: number | string): string => {
      if (numVal === "" || numVal === null || numVal === undefined) return "";
      const n = typeof numVal === "number" ? numVal : parseFloat(numVal.toString().replace(/,/g, ""));
      if (isNaN(n)) return "";
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(n);
    };

    const [displayVal, setDisplayVal] = React.useState<string>(formatDisplay(value));

    React.useEffect(() => {
      setDisplayVal(formatDisplay(value));
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawInput = e.target.value;
      // Strip out non-digit and non-period characters
      const clean = rawInput.replace(/[^0-9.]/g, "");
      
      // Ensure single decimal point
      const parts = clean.split(".");
      if (parts.length > 2) return;

      const numericVal = parseFloat(clean);
      onChange(isNaN(numericVal) ? 0 : numericVal);
      setDisplayVal(rawInput);
    };

    const handleBlur = () => {
      setDisplayVal(formatDisplay(value));
    };

    const currencyInfo = CURRENCY_MAP[currency] || CURRENCY_MAP.USD;

    return (
      <div className={cn("flex items-center rounded-md border border-input bg-background shadow-xs focus-within:ring-1 focus-within:ring-ring", className)}>
        {showCurrencySelector && onCurrencyChange ? (
          <Select value={currency} onValueChange={(val) => onCurrencyChange(val as CurrencyCode)} disabled={disabled}>
            <SelectTrigger className="h-9 w-[110px] rounded-r-none border-0 border-r border-input bg-muted/40 text-xs font-semibold focus:ring-0">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CURRENCY_MAP).map(([code, info]) => (
                <SelectItem key={code} value={code} className="text-xs">
                  {info.label} - {info.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="flex h-9 items-center justify-center px-3 text-xs font-semibold text-muted-foreground border-r border-input bg-muted/30">
            {currencyInfo.symbol}
          </div>
        )}

        <Input
          ref={ref}
          type="text"
          inputMode="decimal"
          value={displayVal}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className="border-0 shadow-none focus-visible:ring-0 text-sm font-mono tracking-tight"
          {...props}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
