import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";

interface FiltersBarProps {
  search: string;
  dateFrom: string;
  dateTo: string;
  onSearchChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onQuickFilter: (type: "today" | "week" | "month" | "clear") => void;
}

export function FiltersBar({
  search,
  dateFrom,
  dateTo,
  onSearchChange,
  onDateFromChange,
  onDateToChange,
  onQuickFilter,
}: FiltersBarProps) {
  const { t } = useI18n();
  return (
    <div className="rounded-xl border bg-white/70 p-4 shadow-sm">
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
    </div>
  );
}
