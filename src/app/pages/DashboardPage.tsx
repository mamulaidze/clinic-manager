import { useEffect, useRef, useState } from "react";
import { FileDown, Plus, RefreshCcw } from "lucide-react";
import { RecordsDashboard } from "@/features/records/RecordsDashboard";
import { AppLayout } from "@/app/layouts";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useUserSettingsMutation, useUserSettingsQuery } from "@/features/records/hooks";

export function DashboardPage() {
  const { t } = useI18n();
  const { data: settings } = useUserSettingsQuery();
  const settingsMutation = useUserSettingsMutation();
  const [showSummary, setShowSummary] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [showTable, setShowTable] = useState(true);
  const initializedRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (initializedRef.current) return;
    if (settings) {
      setShowSummary(settings.show_summary);
      setShowFilters(settings.show_filters);
      setShowTable(settings.show_table);
      initializedRef.current = true;
      return;
    }
    if (settings === null) {
      settingsMutation.mutate({
        show_summary: showSummary,
        show_filters: showFilters,
        show_table: showTable,
      });
      initializedRef.current = true;
    }
  }, [settings, settingsMutation]);

  useEffect(() => {
    if (!initializedRef.current) return;
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = window.setTimeout(() => {
      settingsMutation.mutate({
        show_summary: showSummary,
        show_filters: showFilters,
        show_table: showTable,
      });
    }, 400);
    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [showSummary, showFilters, showTable, settingsMutation]);

  const sidebarContent = (
    <div className="space-y-2 text-xs">
      <div className="px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {t("filters")}
      </div>
      <button
        type="button"
        onClick={() => setShowSummary((value) => !value)}
        className="flex w-full items-center justify-between rounded-md border bg-card/80 px-2 py-1.5 text-[11px]"
      >
        <span>{showSummary ? t("hideSummary") : t("showSummary")}</span>
        {!showSummary && <span className="text-muted-foreground">•</span>}
      </button>
      <button
        type="button"
        onClick={() => setShowFilters((value) => !value)}
        className="flex w-full items-center justify-between rounded-md border bg-card/80 px-2 py-1.5 text-[11px]"
      >
        <span>{showFilters ? t("hideFilters") : t("showFilters")}</span>
        {!showFilters && <span className="text-muted-foreground">•</span>}
      </button>
      <button
        type="button"
        onClick={() => setShowTable((value) => !value)}
        className="flex w-full items-center justify-between rounded-md border bg-card/80 px-2 py-1.5 text-[11px]"
      >
        <span>{showTable ? t("hideTable") : t("showTable")}</span>
        {!showTable && <span className="text-muted-foreground">•</span>}
      </button>
      <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {t("actions")}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-full justify-start gap-2 text-xs"
        onClick={() => window.dispatchEvent(new CustomEvent("records:refresh"))}
      >
        <RefreshCcw className="h-4 w-4" />
        {t("refresh")}
      </Button>
      <Button
        size="sm"
        className="h-8 w-full justify-start gap-2 text-xs"
        onClick={() => window.dispatchEvent(new CustomEvent("records:open-form"))}
      >
        <Plus className="h-4 w-4" />
        {t("addRecord")}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className="h-8 w-full justify-start gap-2 text-xs"
        onClick={() => window.dispatchEvent(new CustomEvent("records:export-csv-filtered"))}
      >
        <FileDown className="h-4 w-4" />
        {t("exportCsv")}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className="h-8 w-full justify-start gap-2 text-xs"
        onClick={() => window.dispatchEvent(new CustomEvent("records:export-pdf-filtered"))}
      >
        <FileDown className="h-4 w-4" />
        {t("exportPdf")}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className="h-8 w-full justify-start gap-2 text-xs"
        onClick={() => window.dispatchEvent(new CustomEvent("records:export-csv-selected"))}
      >
        <FileDown className="h-4 w-4" />
        {t("exportCsvSelected")}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className="h-8 w-full justify-start gap-2 text-xs"
        onClick={() => window.dispatchEvent(new CustomEvent("records:export-pdf-selected"))}
      >
        <FileDown className="h-4 w-4" />
        {t("exportPdfSelected")}
      </Button>
    </div>
  );

  return (
    <AppLayout sidebarContent={sidebarContent}>
      <RecordsDashboard
        showSummary={showSummary}
        showFilters={showFilters}
        showTable={showTable}
      />
    </AppLayout>
  );
}
