import { useEffect, useMemo, useState } from "react";
import { FileDown, Plus, RefreshCcw } from "lucide-react";
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
import { useRecordMutations, useRecordsQuery } from "@/features/records/hooks";
import type { ClinicRecord } from "@/types/clinic";
import { toIsoDate } from "@/lib/formatters";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RecordsDashboard() {
  const { lang, t } = useI18n();
  const { data = [], isLoading, isError, refetch } = useRecordsQuery();
  const { createRecord, updateRecord, deleteRecord } = useRecordMutations();
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClinicRecord | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<ClinicRecord[]>([]);
  const [clearSelectionSignal, setClearSelectionSignal] = useState(0);
  const [clinicName, setClinicName] = useState("");
  const [managerName, setManagerName] = useState("");

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

  const handleCopy = async (record: ClinicRecord) => {
    try {
      await navigator.clipboard.writeText(getShareText(record, lang));
      toast.success(t("shareCopied"));
    } catch {
      toast.error(t("clipboardDenied"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {t("overview")}
          </p>
          <h2 className="text-3xl font-semibold font-display">{t("clinicDashboard")}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => refetch()} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            {t("refresh")}
          </Button>
          <Button variant="secondary" onClick={() => exportCsv(filtered)} className="gap-2">
            <FileDown className="h-4 w-4" />
            {t("exportCsv")}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              void generateFilteredPdf(filtered, lang, clinicName, managerName);
            }}
            className="gap-2"
          >
            <FileDown className="h-4 w-4" />
            {t("exportPdf")}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              void generateFilteredPdf(
                selectedRecords,
                lang,
                clinicName,
                managerName
              );
            }}
            className="gap-2"
            disabled={selectedRecords.length === 0}
          >
            <FileDown className="h-4 w-4" />
            {t("exportPdfSelected")}
          </Button>
          <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("addRecord")}
          </Button>
        </div>
      </div>

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

      <FiltersBar
        search={search}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onSearchChange={setSearch}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onQuickFilter={handleQuickFilter}
      />

      {isError ? (
        <div className="rounded-xl border border-destructive/30 bg-white/70 p-6 text-sm text-destructive">
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
            void generateClientPdf(record, lang, clinicName, managerName);
          }}
          onCopy={handleCopy}
          onSelectionChange={setSelectedRecords}
          clearSelectionSignal={clearSelectionSignal}
        />
      )}

      <div className="rounded-xl border bg-white/70 p-4 shadow-sm">
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
    </div>
  );
}
