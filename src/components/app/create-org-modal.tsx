import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { setCurrentOrgId } from "@/hooks/use-org";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Building2, Plus, Sparkles } from "lucide-react";

interface CreateOrgModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateOrgModal({ open, onOpenChange }: CreateOrgModalProps) {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("Technology / SaaS");
  const [baseCurrency, setBaseCurrency] = useState("USD ($)");
  const [fiscalStart, setFiscalStart] = useState("January");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter a workspace name");

    setLoading(true);
    try {
      // 1. Create org using RPC
      const { data: orgId, error: rpcErr } = await supabase.rpc("create_organization", {
        _name: name.trim(),
      });
      if (rpcErr) throw rpcErr;

      const createdId = orgId as unknown as string;
      if (createdId) {
        // 2. Update optional settings (industry, currency, fiscal year)
        await supabase
          .from("organizations")
          .update({
            industry,
            base_currency: baseCurrency,
            fiscal_year_start: fiscalStart,
            onboarding_completed: true,
          })
          .eq("id", createdId);

        setCurrentOrgId(createdId);
        queryClient.invalidateQueries();
        toast.success(`Workspace "${name}" created!`);
        setName("");
        onOpenChange(false);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-widest font-semibold mb-1">
            <Building2 className="h-4 w-4" /> Multi-Tenant Workspace
          </div>
          <DialogTitle className="text-xl font-bold">Create New Organization</DialogTitle>
          <DialogDescription className="text-sm">
            Spin up an isolated financial workspace for your company, division, or subsidiary.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="create-org-name">
              Organization Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="create-org-name"
              placeholder="e.g. Acme Global Corp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-h-11"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="min-h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology / SaaS">Technology / SaaS</SelectItem>
                  <SelectItem value="Financial Services">Financial Services</SelectItem>
                  <SelectItem value="Healthcare & Bio">Healthcare & Bio</SelectItem>
                  <SelectItem value="Retail & E-commerce">Retail & E-commerce</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Professional Services">Professional Services</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Base Currency</Label>
              <Select value={baseCurrency} onValueChange={setBaseCurrency}>
                <SelectTrigger className="min-h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD ($)">USD ($)</SelectItem>
                  <SelectItem value="EUR (€)">EUR (€)</SelectItem>
                  <SelectItem value="GBP (£)">GBP (£)</SelectItem>
                  <SelectItem value="NGN (₦)">NGN (₦)</SelectItem>
                  <SelectItem value="CAD ($)">CAD ($)</SelectItem>
                  <SelectItem value="AUD ($)">AUD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Fiscal Year Start Month</Label>
            <Select value={fiscalStart} onValueChange={setFiscalStart}>
              <SelectTrigger className="min-h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="January">January (Standard Calendar Year)</SelectItem>
                <SelectItem value="April">April (UK / India Tax Year)</SelectItem>
                <SelectItem value="July">July (Australian / US Mid-Year)</SelectItem>
                <SelectItem value="October">October (US Federal Govt Fiscal Year)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4 border-t border-border mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="gap-1.5 font-semibold"
            >
              <Plus className="h-4 w-4" />
              {loading ? "Creating…" : "Create Workspace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
