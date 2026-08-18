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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Users, Upload, Send, CheckCircle2, AlertCircle } from "lucide-react";
import type { OrgRole } from "@/hooks/use-org";

interface BulkInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
}

export function BulkInviteModal({ open, onOpenChange, orgId }: BulkInviteModalProps) {
  const [rawInput, setRawInput] = useState("");
  const [role, setRole] = useState<OrgRole>("contributor");
  const [sending, setSending] = useState(false);
  const queryClient = useQueryClient();

  function parseEmails(text: string): string[] {
    const tokens = text.split(/[\s,;\n]+/);
    const emails = tokens
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 3 && t.includes("@") && t.includes("."));
    return Array.from(new Set(emails));
  }

  const parsedList = parseEmails(rawInput);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setRawInput((prev) => (prev ? prev + "\n" + content : content));
    };
    reader.readAsText(file);
  }

  async function handleBulkInvite() {
    if (!orgId || parsedList.length === 0) return toast.error("No valid email addresses found");

    setSending(true);
    try {
      const rows = parsedList.map((email) => ({
        org_id: orgId,
        email,
        role,
      }));

      const { error } = await supabase.from("org_invites").insert(rows);
      if (error) throw error;

      toast.success(`Successfully queued invitations for ${parsedList.length} user(s)!`);
      setRawInput("");
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["invites", orgId] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk invite failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-widest font-semibold mb-1">
            <Users className="h-4 w-4" /> Team Collaboration
          </div>
          <DialogTitle className="text-xl font-bold">Bulk Invite Teammates</DialogTitle>
          <DialogDescription className="text-sm">
            Paste comma-separated or newline-separated emails, or upload a CSV file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Assigned Role for Invitees</Label>
              <span className="text-[11px] font-mono text-muted-foreground uppercase">{role}</span>
            </div>
            <Select value={role} onValueChange={(v) => setRole(v as OrgRole)}>
              <SelectTrigger className="min-h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner — Full Admin & Billing Control</SelectItem>
                <SelectItem value="admin">Admin — Manage Budgets & Team</SelectItem>
                <SelectItem value="finance_manager">
                  Finance Manager — Approvals & Entries
                </SelectItem>
                <SelectItem value="department_lead">Department Lead — Department Spend</SelectItem>
                <SelectItem value="contributor">Contributor — Submit Expense Logs</SelectItem>
                <SelectItem value="viewer">Viewer — Read-Only Reports</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Email Addresses</Label>
              <label className="cursor-pointer text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                <Upload className="h-3.5 w-3.5" /> Upload CSV
                <input
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            <Textarea
              placeholder="alex@acme.com, sarah@acme.com, devin@acme.com..."
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              className="min-h-[120px] font-mono text-xs"
            />
          </div>

          {rawInput.trim().length > 0 && (
            <div className="rounded-md bg-muted p-3 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>
                  Parsed <strong className="font-bold">{parsedList.length}</strong> unique valid
                  email address(es).
                </span>
              </div>
              {parsedList.length === 0 && (
                <span className="text-amber-500 flex items-center gap-1 font-semibold">
                  <AlertCircle className="h-3.5 w-3.5" /> Invalid format
                </span>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="pt-2 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
            Cancel
          </Button>
          <Button
            onClick={handleBulkInvite}
            disabled={sending || parsedList.length === 0}
            className="gap-2 font-semibold"
          >
            <Send className="h-4 w-4" />
            {sending ? "Sending Invitations…" : `Send ${parsedList.length} Invite(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
