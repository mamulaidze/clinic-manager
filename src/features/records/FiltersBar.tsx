import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";

interface FiltersBarProps {
  search: string;
  dateFrom: string;
  dateTo: string;
  presetName: string;
  presets: { id: string; name: string }[];
  selectedPresetId: string;
  onSearchChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onQuickFilter: (type: "today" | "week" | "month" | "clear") => void;
  onPresetNameChange: (value: string) => void;
  onSavePreset: () => void;
  onLoadPreset: (id: string) => void;
  onOpenRename: () => void;
  onOpenDelete: () => void;
  isRenameDisabled: boolean;
  isDeleteDisabled: boolean;
}

export function FiltersBar({
  search,
  dateFrom,
  dateTo,
  presetName,
  presets,
  selectedPresetId,
  onSearchChange,
  onDateFromChange,
  onDateToChange,
  onQuickFilter,
  onPresetNameChange,
  onSavePreset,
  onLoadPreset,
  onOpenRename,
  onOpenDelete,
  isRenameDisabled,
  isDeleteDisabled,
}: FiltersBarProps) {
  const { t } = useI18n();
  return (
    <div className="rounded-xl border bg-card/70 p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end">
        <div className="space-y-2">
          <Label htmlFor="search">{t("search")}</Label>
          <Input
            id="search"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date-from">{t("from")}</Label>
          <Input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(event) => onDateFromChange(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date-to">{t("to")}</Label>
          <Input
            id="date-to"
            type="date"
            value={dateTo}
            onChange={(event) => onDateToChange(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => onQuickFilter("today")}>{t("today")}</Button>
          <Button variant="outline" size="sm" onClick={() => onQuickFilter("week")}>{t("thisWeek")}</Button>
          <Button variant="outline" size="sm" onClick={() => onQuickFilter("month")}>{t("thisMonth")}</Button>
          <Button variant="ghost" size="sm" onClick={() => onQuickFilter("clear")}>{t("clear")}</Button>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[2fr_1fr_auto] md:items-end">
        <div className="space-y-2">
          <Label htmlFor="preset-name">{t("presetName")}</Label>
          <Input
            id="preset-name"
            value={presetName}
            onChange={(event) => onPresetNameChange(event.target.value)}
            placeholder={t("presetName")}
          />
          <p className="text-xs text-muted-foreground">{t("presetHelp")}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="preset-select">{t("presets")}</Label>
          <select
            id="preset-select"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            onChange={(event) => onLoadPreset(event.target.value)}
            value={selectedPresetId}
          >
            <option value="" disabled>
              {t("presets")}
            </option>
            {presets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={onSavePreset} className="h-10">
            {t("savePreset")}
          </Button>
          <Button
            variant="outline"
            onClick={onOpenRename}
            className="h-10"
            disabled={isRenameDisabled}
          >
            {t("renamePreset")}
          </Button>
          <Button
            variant="ghost"
            onClick={onOpenDelete}
            className="h-10"
            disabled={isDeleteDisabled}
          >
            {t("deletePreset")}
          </Button>
        </div>
      </div>
    </div>
  );
}
