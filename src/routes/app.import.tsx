import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import Papa from "papaparse";
import { PageHeader, PageBody } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentOrgId, useMemberships } from "@/hooks/use-org";
import { useBudgetEntries } from "@/hooks/use-budget-entries";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Save,
  ArrowRight,
  RefreshCw,
  Edit2,
  Sparkles,
  Layers,
} from "lucide-react";
import {
  SchemaField,
  SCHEMA_FIELDS,
  SOURCE_PRESETS,
  PresetType,
  guessColumnMapping,
  getSavedMappingTemplates,
  saveMappingTemplate,
  validatePreFlight,
  ValidatedRow,
} from "@/lib/import-engine";

export const Route = createFileRoute("/app/import")({
  component: ImportPage,
});

const CSV_TEMPLATE =
  "Category,Department,Budgeted Amount,Actual Spend,Period,Date,Vendor,Notes\nMarketing,Growth & Marketing,50000,42315,2026-Q1,2026-02-01,LinkedIn Ads,Q1 paid social campaigns\nSalaries,Engineering,320000,318200,2026-Q1,2026-02-01,Paychex,Engineering payroll\nCloud Infrastructure,Engineering,18000,21430,2026-Q1,2026-02-05,AWS,Overage on compute clusters\n";

function ImportPage() {
  const orgId = useCurrentOrgId();
  const memberships = useMemberships();
  const isViewer = memberships.data?.find((m) => m.org_id === orgId)?.role === "viewer";
  const qc = useQueryClient();
  const { data: existingEntries } = useBudgetEntries();

  // Wizard Step: 1 = Upload, 2 = Mapping, 3 = Validation Grid, 4 = Commit Progress
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<PresetType>("generic");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, SchemaField | "">>({});

  // Validation State
  const [validatedRows, setValidatedRows] = useState<ValidatedRow[]>([]);
  const [autoCreateMissing, setAutoCreateMissing] = useState(true);

  // Template Modal State
  const [saveTplOpen, setSaveTplOpen] = useState(false);
  const [tplName, setTplName] = useState("");
  const savedTemplates = useMemo(() => getSavedMappingTemplates(), [saveTplOpen]);

  // Commit state
  const [commitProgress, setCommitProgress] = useState(0);
  const [commitSuccess, setCommitSuccess] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  function downloadSampleTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "budgetit-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFileSelect(f: File) {
    if (f.size > 10 * 1024 * 1024) {
      return toast.error("File size exceeds 10MB limit");
    }
    setFile(f);

    Papa.parse<Record<string, string>>(f, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const parsedHeaders = res.meta.fields ?? [];
        setHeaders(parsedHeaders);
        setRawRows(res.data);

        // Apply selected preset or fuzzy match
        const sourcePreset = SOURCE_PRESETS.find((p) => p.id === preset);
        if (sourcePreset && Object.keys(sourcePreset.mapping).length > 0) {
          const presetMap: Record<string, SchemaField | ""> = {};
          for (const h of parsedHeaders) {
            presetMap[h] = sourcePreset.mapping[h] || "";
          }
          setMapping(presetMap);
        } else {
          setMapping(guessColumnMapping(parsedHeaders));
        }

        setStep(2);
        toast.success(`Loaded ${res.data.length} rows from ${f.name}`);
      },
      error: () => toast.error("Failed to parse file format"),
    });
  }

  function applyPreset(pId: PresetType) {
    setPreset(pId);
    const sourcePreset = SOURCE_PRESETS.find((p) => p.id === pId);
    if (headers.length > 0) {
      if (sourcePreset && Object.keys(sourcePreset.mapping).length > 0) {
        const presetMap: Record<string, SchemaField | ""> = {};
        for (const h of headers) {
          presetMap[h] = sourcePreset.mapping[h] || "";
        }
        setMapping(presetMap);
      } else {
        setMapping(guessColumnMapping(headers));
      }
    }
  }

  function applySavedTemplate(tpl: (typeof savedTemplates)[0]) {
    setMapping(tpl.mapping);
    toast.success(`Applied mapping template "${tpl.name}"`);
  }

  function handleSaveTemplate() {
    if (!tplName.trim()) return toast.error("Please enter template name");
    saveMappingTemplate(tplName.trim(), mapping);
    setSaveTplOpen(false);
    setTplName("");
    toast.success("Mapping template saved");
  }

  function proceedToValidation() {
    const requiredAssigned = SCHEMA_FIELDS.filter((f) => f.required).every((f) =>
      Object.values(mapping).includes(f.key),
    );
    if (!requiredAssigned) {
      return toast.error("Please map all mandatory required fields (Category, Department, Budgeted, Actual, Period)");
    }

    const validated = validatePreFlight(rawRows, mapping, existingEntries);
    setValidatedRows(validated);
    setStep(3);
  }

  function handleCellEdit(rowIndex: number, field: keyof ValidatedRow["mappedData"], val: string | number) {
    setValidatedRows((prev) =>
      prev.map((row) => {
        if (row.rowIndex === rowIndex) {
          const updatedMapped = { ...row.mappedData, [field]: val };
          // Re-validate row
          const errs = [...row.errors];
          if (field === "category" && val) {
            const idx = errs.indexOf("Missing mandatory Category");
            if (idx >= 0) errs.splice(idx, 1);
          }
          return {
            ...row,
            mappedData: updatedMapped,
            errors: errs,
            isValid: errs.length === 0,
          };
        }
        return row;
      }),
    );
  }

  async function executeBatchCommit() {
    if (!orgId) return toast.error("No active workspace");
    const validRows = validatedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return toast.error("No valid rows to commit");

    setStep(4);
    setBusy(true);
    setCommitProgress(20);

    const { data: userData } = await supabase.auth.getUser();

    const inserts = validRows.map((r) => ({
      org_id: orgId,
      created_by: userData.user?.id || null,
      category: r.mappedData.category,
      department: r.mappedData.department,
      budgeted_amount: r.mappedData.budgeted_amount,
      actual_amount: r.mappedData.actual_amount,
      period: r.mappedData.period,
      vendor: r.mappedData.vendor || null,
      notes: r.mappedData.notes || null,
    }));

    setCommitProgress(60);

    try {
      const { error } = await supabase.from("budget_entries").insert(inserts);
      if (error) throw error;

      setCommitProgress(100);
      setCommitSuccess(inserts.length);
      toast.success(`Successfully imported ${inserts.length} budget entries`);
      qc.invalidateQueries();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Batch commit failed");
    } finally {
      setBusy(false);
    }
  }

  function resetWizard() {
    setStep(1);
    setFile(null);
    setRawRows([]);
    setHeaders([]);
    setMapping({});
    setValidatedRows([]);
    setCommitSuccess(null);
  }

  if (isViewer) {
    return (
      <>
        <PageHeader title="Import Data" description="Import financial statements." />
        <PageBody>
          <div className="rounded-lg border border-border p-8 text-center text-sm text-muted-foreground">
            You have read-only permissions in this organization.
          </div>
        </PageBody>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Smart Data Import Wizard"
        description="Upload CSV/Excel statement files, map headers, run dry-run validation, and commit records."
      >
        <Button variant="outline" size="sm" onClick={downloadSampleTemplate}>
          <Download className="mr-1.5 h-4 w-4" />
          Sample CSV Template
        </Button>
      </PageHeader>

      <PageBody>
        {/* WIZARD STEP INDICATOR */}
        <div className="mb-8 flex items-center justify-between border-b border-border pb-4 text-xs font-mono">
          <div className={`flex items-center gap-2 ${step >= 1 ? "font-bold text-foreground" : "text-muted-foreground"}`}>
            <span className="grid h-6 w-6 place-items-center rounded-full bg-muted">1</span>
            Upload & Presets
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          <div className={`flex items-center gap-2 ${step >= 2 ? "font-bold text-foreground" : "text-muted-foreground"}`}>
            <span className="grid h-6 w-6 place-items-center rounded-full bg-muted">2</span>
            Column Mapping
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          <div className={`flex items-center gap-2 ${step >= 3 ? "font-bold text-foreground" : "text-muted-foreground"}`}>
            <span className="grid h-6 w-6 place-items-center rounded-full bg-muted">3</span>
            Pre-Flight Validation
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          <div className={`flex items-center gap-2 ${step >= 4 ? "font-bold text-foreground" : "text-muted-foreground"}`}>
            <span className="grid h-6 w-6 place-items-center rounded-full bg-muted">4</span>
            Batch Commit
          </div>
        </div>

        {/* STEP 1: UPLOAD & PRESETS */}
        {step === 1 && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <Card className="border-dashed border-2 border-border p-8 text-center hover:border-primary/50 transition-colors">
              <CardContent className="space-y-4 pt-4">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Drag & Drop CSV or Excel Statement File</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports .csv, .xlsx, .xls formats (Up to 10MB)
                  </p>
                </div>
                <div className="flex justify-center">
                  <Label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center rounded-md bg-foreground px-4 py-2 text-xs font-semibold text-background hover:bg-foreground/90"
                  >
                    Select File From Device
                  </Label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileSelect(f);
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Source Format Presets
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {SOURCE_PRESETS.map((p) => (
                  <Card
                    key={p.id}
                    onClick={() => applyPreset(p.id)}
                    className={`cursor-pointer transition-all border ${
                      preset === p.id ? "border-primary bg-primary/5 shadow-xs" : "border-border hover:border-foreground/20"
                    }`}
                  >
                    <CardHeader className="p-4">
                      <CardTitle className="text-xs font-bold flex items-center justify-between">
                        {p.name}
                        {preset === p.id && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                      </CardTitle>
                      <CardDescription className="text-[11px] leading-snug">
                        {p.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: COLUMN MAPPING */}
        {step === 2 && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">Map Column Headers to Schema</h3>
                <p className="text-xs text-muted-foreground">
                  File: <span className="font-mono">{file?.name}</span> ({rawRows.length} parsed rows)
                </p>
              </div>
              <div className="flex gap-2">
                {savedTemplates.length > 0 && (
                  <Select onValueChange={(val) => {
                    const tpl = savedTemplates.find((t) => t.id === val);
                    if (tpl) applySavedTemplate(tpl);
                  }}>
                    <SelectTrigger className="h-8 w-[160px] text-xs">
                      <SelectValue placeholder="Load Saved Template" />
                    </SelectTrigger>
                    <SelectContent>
                      {savedTemplates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button variant="outline" size="sm" onClick={() => setSaveTplOpen(true)}>
                  <Save className="mr-1.5 h-3.5 w-3.5" /> Save Template
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {headers.map((csvHeader) => (
                <div key={csvHeader} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                  <span className="font-mono text-xs font-medium truncate max-w-[180px]" title={csvHeader}>
                    {csvHeader}
                  </span>
                  <Select
                    value={mapping[csvHeader] || "none"}
                    onValueChange={(val) =>
                      setMapping((prev) => ({
                        ...prev,
                        [csvHeader]: val === "none" ? "" : (val as SchemaField),
                      }))
                    }
                  >
                    <SelectTrigger className="h-8 w-[180px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Ignore Column --</SelectItem>
                      {SCHEMA_FIELDS.map((field) => (
                        <SelectItem key={field.key} value={field.key}>
                          {field.label} {field.required ? "*" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back to Upload
              </Button>
              <Button onClick={proceedToValidation}>
                Run Pre-Flight Validation <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: PRE-FLIGHT VALIDATION GRID */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold">Dry-Run Pre-Flight Validation Preview</h3>
                <p className="text-xs text-muted-foreground">
                  Review validation checks and edit cell values directly in the preview grid before committing.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center space-x-2 border border-border p-2 rounded-md">
                  <Switch id="auto-create" checked={autoCreateMissing} onCheckedChange={setAutoCreateMissing} />
                  <Label htmlFor="auto-create" className="cursor-pointer">
                    Auto-create missing Categories & Departments
                  </Label>
                </div>
                <Button onClick={executeBatchCommit}>
                  Commit Valid Records ({validatedRows.filter((r) => r.isValid).length})
                </Button>
              </div>
            </div>

            {/* VALIDATION GRID TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Category *</TableHead>
                    <TableHead>Department *</TableHead>
                    <TableHead className="text-right">Budgeted ($)</TableHead>
                    <TableHead className="text-right">Actual ($)</TableHead>
                    <TableHead>Period *</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status & Flags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validatedRows.map((row) => (
                    <TableRow
                      key={row.rowIndex}
                      className={
                        !row.isValid
                          ? "bg-rose-500/5 hover:bg-rose-500/10"
                          : row.isDuplicate
                          ? "bg-amber-500/5 hover:bg-amber-500/10"
                          : ""
                      }
                    >
                      <TableCell className="font-mono text-xs">{row.rowIndex}</TableCell>
                      <TableCell>
                        <Input
                          className="h-7 text-xs border-muted font-medium"
                          value={row.mappedData.category}
                          onChange={(e) => handleCellEdit(row.rowIndex, "category", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-7 text-xs border-muted font-medium"
                          value={row.mappedData.department}
                          onChange={(e) => handleCellEdit(row.rowIndex, "department", e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        <Input
                          type="number"
                          className="h-7 text-xs text-right border-muted font-mono"
                          value={row.mappedData.budgeted_amount}
                          onChange={(e) =>
                            handleCellEdit(row.rowIndex, "budgeted_amount", parseFloat(e.target.value) || 0)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        <Input
                          type="number"
                          className="h-7 text-xs text-right border-muted font-mono"
                          value={row.mappedData.actual_amount}
                          onChange={(e) =>
                            handleCellEdit(row.rowIndex, "actual_amount", parseFloat(e.target.value) || 0)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        <Input
                          className="h-7 text-xs border-muted font-mono"
                          value={row.mappedData.period}
                          onChange={(e) => handleCellEdit(row.rowIndex, "period", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-7 text-xs border-muted"
                          value={row.mappedData.vendor}
                          onChange={(e) => handleCellEdit(row.rowIndex, "vendor", e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        <Input
                          type="date"
                          className="h-7 text-xs border-muted font-mono"
                          value={row.mappedData.date}
                          onChange={(e) => handleCellEdit(row.rowIndex, "date", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {row.isValid ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] w-fit">
                              Ready
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px] w-fit">
                              Invalid
                            </Badge>
                          )}
                          {row.isDuplicate && (
                            <Badge variant="outline" className="text-amber-600 border-amber-500/20 text-[9px] w-fit">
                              Duplicate Alert
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back to Mapping
              </Button>
              <Button onClick={executeBatchCommit}>Commit Valid Records</Button>
            </div>
          </div>
        )}

        {/* STEP 4: BATCH COMMIT PROGRESS */}
        {step === 4 && (
          <Card className="max-w-md mx-auto p-6 text-center space-y-6">
            <CardHeader className="p-0">
              <CardTitle className="text-lg">
                {commitSuccess !== null ? "Import Complete!" : "Inserting Records into Database..."}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 p-0">
              <Progress value={commitProgress} className="h-3" />
              <p className="text-xs text-muted-foreground font-mono">
                {commitSuccess !== null ? `Inserted ${commitSuccess} rows successfully` : "Processing batch commits..."}
              </p>

              {commitSuccess !== null && (
                <div className="pt-4">
                  <Button onClick={resetWizard} className="w-full">
                    Import Another File
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </PageBody>

      {/* SAVE TEMPLATE MODAL */}
      <Dialog open={saveTplOpen} onOpenChange={setSaveTplOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Mapping Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div>
              <Label>Template Preset Name</Label>
              <Input
                placeholder="e.g. Monthly AWS Billing CSV"
                value={tplName}
                onChange={(e) => setTplName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveTplOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
