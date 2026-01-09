import { useEffect, useMemo, useState } from "react";
import { FileDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FiltersBar } from "@/features/records/FiltersBar";
import { RecordFormDialog, type RecordFormValues } from "@/features/records/RecordFormDialog";
import { RecordsTable } from "@/features/records/RecordsTable";
import { SummaryCards } from "@/features/records/SummaryCards";
import { exportCsv } from "@/features/records/export";
import { generateClientPdf, generateFilteredPdf, getShareText } from "@/features/records/pdf";
import { MATERIAL_FIELDS } from "@/features/records/constants";
import { usePresetMutations, usePresetsQuery, useRecordMutations, useRecordsQuery } from "@/features/records/hooks";
import type { ClinicRecord } from "@/types/clinic";
import { toIsoDate } from "@/lib/formatters";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RecordsDashboardProps {
  showSummary: boolean;
  showFilters: boolean;
  showTable: boolean;
}

export function RecordsDashboard({
  showSummary,
  showFilters,
  showTable,
}: RecordsDashboardProps) {
  const { lang, t } = useI18n();
  const { data = [], isLoading, isError, refetch } = useRecordsQuery();
  const { createRecord, updateRecord, deleteRecord } = useRecordMutations();
  const { data: presets = [] } = usePresetsQuery();
  const { createPreset, updatePreset, deletePreset } = usePresetMutations();
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClinicRecord | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<ClinicRecord[]>([]);
  const [clearSelectionSignal, setClearSelectionSignal] = useState(0);
  const [clinicName, setClinicName] = useState("");
  const [managerName, setManagerName] = useState("");
  const [presetName, setPresetName] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState("");
  const [isSelectedPdfLoading, setIsSelectedPdfLoading] = useState(false);
  const [isRowPdfLoading, setIsRowPdfLoading] = useState<string | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    const storedClinic = localStorage.getItem("clinic_name");
    const storedManager = localStorage.getItem("clinic_manager");
    if (storedClinic) setClinicName(storedClinic);
    if (storedManager) setManagerName(storedManager);
  }, []);

  useEffect(() => {
    localStorage.setItem("clinic_name", clinicName);
  }, [clinicName]);

  useEffect(() => {
    localStorage.setItem("clinic_manager", managerName);
  }, [managerName]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.filter((record) => {
      const matchesQuery = query
        ? `${record.name} ${record.surname} ${record.mobile}`
            .toLowerCase()
            .includes(query)
        : true;
      const matchesFrom = dateFrom ? record.date >= dateFrom : true;
      const matchesTo = dateTo ? record.date <= dateTo : true;
      return matchesQuery && matchesFrom && matchesTo;
    });
  }, [data, search, dateFrom, dateTo]);

  const summary = useMemo(() => {
    const totalMoney = filtered.reduce((acc, record) => acc + record.money, 0);
    const totals: Record<string, number> = {};
    MATERIAL_FIELDS.forEach((field) => {
      totals[field.key] = filtered.reduce(
        (acc, record) => acc + (record[field.key] ?? 0),
        0
      );
    });
    return { totalMoney, totals };
  }, [filtered]);

  const handleQuickFilter = (type: "today" | "week" | "month" | "clear") => {
    const now = new Date();
    if (type === "clear") {
      setDateFrom("");
      setDateTo("");
      setClearSelectionSignal((value) => value + 1);
      setSelectedRecords([]);
      return;
    }

    if (type === "today") {
      const today = toIsoDate(now);
      setDateFrom(today);
      setDateTo(today);
      return;
    }

    if (type === "week") {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      setDateFrom(toIsoDate(start));
      setDateTo(toIsoDate(end));
      return;
    }

    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setDateFrom(toIsoDate(start));
    setDateTo(toIsoDate(end));
  };

  const handleSavePreset = () => {
    const name = presetName.trim();
    if (!name) return;
    void createPreset.mutateAsync({
      name,
      search,
      date_from: dateFrom || null,
      date_to: dateTo || null,
    });
    setPresetName("");
  };

  const handleLoadPreset = (id: string) => {
    setSelectedPresetId(id);
    const preset = presets.find((item) => item.id === id);
    if (preset) {
      setSearch(preset.search ?? "");
      setDateFrom(preset.date_from ?? "");
      setDateTo(preset.date_to ?? "");
    }
  };

  const handleRenamePreset = () => {
    if (!selectedPresetId) return;
    const name = presetName.trim();
    if (!name) return;
    const preset = presets.find((item) => item.id === selectedPresetId);
    if (!preset) return;
    void updatePreset.mutateAsync({ ...preset, name });
    setPresetName("");
  };

  const handleDeletePreset = () => {
    if (!selectedPresetId) return;
    void deletePreset.mutateAsync(selectedPresetId);
    setSelectedPresetId("");
  };

  const handleSubmit = async (values: RecordFormValues) => {
    try {
      if (editing) {
        await updateRecord.mutateAsync({ ...editing, ...values });
        toast.success(t("recordUpdated"));
      } else {
        await createRecord.mutateAsync({ ...values, notes: values.notes ?? null });
        toast.success(t("recordCreated"));
      }
      setEditing(null);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : t("saveFailed");
      toast.error(message);
      return false;
    }
  };

  const handleDelete = async (record: ClinicRecord) => {
    try {
      await deleteRecord.mutateAsync(record.id);
      toast.success(t("recordDeleted"));
    } catch (error) {
      const message = error instanceof Error ? error.message : t("deleteFailed");
      toast.error(message);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(
        selectedRecords.map((record) => deleteRecord.mutateAsync(record.id))
      );
      toast.success(t("recordDeleted"));
      setSelectedRecords([]);
      setClearSelectionSignal((value) => value + 1);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("deleteFailed");
      toast.error(message);
    }
  };

  const handleCopy = async (record: ClinicRecord) => {
    try {
      await navigator.clipboard.writeText(getShareText(record, lang));
      toast.success(t("shareCopied"));
    } catch {
      toast.error(t("clipboardDenied"));
    }
  };

  const handleFilteredPdf = async (records: ClinicRecord[]) => {
    await generateFilteredPdf(records, lang, clinicName, managerName);
  };

  const handleSelectedPdf = async () => {
    setIsSelectedPdfLoading(true);
    try {
      await generateFilteredPdf(selectedRecords, lang, clinicName, managerName);
    } finally {
      setIsSelectedPdfLoading(false);
    }
  };

  useEffect(() => {
    const handleOpenForm = () => {
      setEditing(null);
      setFormOpen(true);
    };

    const handleRefresh = () => {
      void refetch();
    };

    const handleExportCsvFiltered = () => exportCsv(filtered);
    const handleExportCsvSelected = () => exportCsv(selectedRecords);
    const handleExportPdfFiltered = () => void handleFilteredPdf(filtered);
    const handleExportPdfSelected = () => void handleSelectedPdf();

    window.addEventListener("records:open-form", handleOpenForm);
    window.addEventListener("records:refresh", handleRefresh);
    window.addEventListener("records:export-csv-filtered", handleExportCsvFiltered);
    window.addEventListener("records:export-csv-selected", handleExportCsvSelected);
    window.addEventListener("records:export-pdf-filtered", handleExportPdfFiltered);
    window.addEventListener("records:export-pdf-selected", handleExportPdfSelected);

    return () => {
      window.removeEventListener("records:open-form", handleOpenForm);
      window.removeEventListener("records:refresh", handleRefresh);
      window.removeEventListener("records:export-csv-filtered", handleExportCsvFiltered);
      window.removeEventListener("records:export-csv-selected", handleExportCsvSelected);
      window.removeEventListener("records:export-pdf-filtered", handleExportPdfFiltered);
      window.removeEventListener("records:export-pdf-selected", handleExportPdfSelected);
    };
  }, [
    filtered,
    selectedRecords,
    refetch,
    handleFilteredPdf,
    handleSelectedPdf,
  ]);

  return (
    <div
      className={cn("space-y-6", selectedRecords.length > 0 && "pb-28")}
      id="top"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {t("overview")}
          </p>
          <h2 className="text-3xl font-semibold font-display">{t("clinicDashboard")}</h2>
        </div>
        <div className="text-sm text-muted-foreground">{t("summary")}</div>
      </div>

      {showSummary && (
        <>
          {isLoading ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : (
            <SummaryCards
              count={filtered.length}
              totalMoney={summary.totalMoney}
              materialTotals={summary.totals}
            />
          )}
        </>
      )}
      {!showSummary && (
        <div className="rounded-xl border border-dashed bg-card/60 p-4 text-sm text-muted-foreground">
          <div className="font-semibold">{t("hiddenSummary")}</div>
          <div className="text-xs">{t("hiddenHint")}</div>
        </div>
      )}

      {showFilters && (
        <FiltersBar
          search={search}
          dateFrom={dateFrom}
          dateTo={dateTo}
          presetName={presetName}
          presets={presets.map((preset) => ({ id: preset.id, name: preset.name }))}
          selectedPresetId={selectedPresetId}
          onSearchChange={setSearch}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onQuickFilter={handleQuickFilter}
          onPresetNameChange={setPresetName}
          onSavePreset={handleSavePreset}
          onLoadPreset={handleLoadPreset}
          onOpenRename={() => setRenameOpen(true)}
          onOpenDelete={() => setDeleteOpen(true)}
          isRenameDisabled={!selectedPresetId}
          isDeleteDisabled={!selectedPresetId}
        />
      )}
      {!showFilters && (
        <div className="rounded-xl border border-dashed bg-card/60 p-4 text-sm text-muted-foreground">
          <div className="font-semibold">{t("hiddenFilters")}</div>
          <div className="text-xs">{t("hiddenHint")}</div>
        </div>
      )}

      {showTable && (
        <>
          {isError ? (
            <div className="rounded-xl border border-destructive/30 bg-card/70 p-6 text-sm text-destructive">
              {t("failedToLoad")}
            </div>
          ) : (
            <RecordsTable
              data={filtered}
              onEdit={(record) => {
                setEditing(record);
                setFormOpen(true);
              }}
              onDelete={handleDelete}
              onPdf={(record) => {
                setIsRowPdfLoading(record.id);
                void generateClientPdf(
                  record,
                  lang,
                  clinicName,
                  managerName
                ).finally(() => setIsRowPdfLoading(null));
              }}
              onCopy={handleCopy}
          onSelectionChange={setSelectedRecords}
          clearSelectionSignal={clearSelectionSignal}
          pdfLoadingId={isRowPdfLoading}
        />
          )}
        </>
      )}
      {!showTable && (
        <div className="rounded-xl border border-dashed bg-card/60 p-4 text-sm text-muted-foreground">
          <div className="font-semibold">{t("hiddenTable")}</div>
          <div className="text-xs">{t("hiddenHint")}</div>
        </div>
      )}

      {selectedRecords.length > 0 && (
        <div className="fixed inset-x-4 bottom-4 z-40">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/20 bg-gradient-to-r from-background/60 via-background/80 to-background/60 p-4 text-sm shadow-[0_12px_28px_rgba(0,0,0,0.2)] backdrop-blur-xl">
          <div className="text-muted-foreground">
            {selectedRecords.length} {t("selectedCount")}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedRecords([]);
                setClearSelectionSignal((value) => value + 1);
              }}
            >
              {t("clearSelection")}
            </Button>
            <Button
              variant="secondary"
              onClick={() => exportCsv(selectedRecords)}
              className="gap-2"
            >
              <FileDown className="h-4 w-4" />
              {t("exportCsvSelected")}
            </Button>
            <Button
              variant="secondary"
              onClick={() => void handleSelectedPdf()}
              className="gap-2"
              disabled={isSelectedPdfLoading}
            >
              <FileDown className="h-4 w-4" />
              {isSelectedPdfLoading ? t("generatingPdf") : t("exportPdfSelected")}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  {t("deleteSelected")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("deleteRecordTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("deleteRecordHint")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteSelected}>
                    {t("delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        </div>
      )}

      <div className="rounded-xl border bg-card/70 p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="clinic-name">{t("clinicName")}</Label>
            <Input
              id="clinic-name"
              value={clinicName}
              onChange={(event) => setClinicName(event.target.value)}
              placeholder={t("clinicName")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="manager-name">{t("managerName")}</Label>
            <Input
              id="manager-name"
              value={managerName}
              onChange={(event) => setManagerName(event.target.value)}
              placeholder={t("managerName")}
            />
          </div>
        </div>
      </div>

      <RecordFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editing}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={renameOpen} onOpenChange={setRenameOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("renamePreset")}</AlertDialogTitle>
            <AlertDialogDescription>{t("presetHelp")}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rename-preset">{t("presetName")}</Label>
            <Input
              id="rename-preset"
              value={presetName}
              onChange={(event) => setPresetName(event.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleRenamePreset();
                setRenameOpen(false);
              }}
            >
              {t("savePreset")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deletePreset")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteRecordHint")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleDeletePreset();
                setDeleteOpen(false);
              }}
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
