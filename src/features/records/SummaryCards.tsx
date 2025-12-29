import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/formatters";
import { MATERIAL_FIELDS } from "@/features/records/constants";
import { useI18n } from "@/lib/i18n";

interface SummaryCardsProps {
  count: number;
  totalMoney: number;
  materialTotals: Record<string, number>;
}

export function SummaryCards({ count, totalMoney, materialTotals }: SummaryCardsProps) {
  const { lang, t } = useI18n();
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>{t("totalMoney")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">
            {formatMoney(totalMoney, lang === "ka" ? "ka-GE" : "en-US")}
          </p>
          <p className="text-xs text-muted-foreground">{t("moneyTotalHint")}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t("recordsCount")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{count}</p>
          <p className="text-xs text-muted-foreground">{t("recordsCountHint")}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t("materialsTotals")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {MATERIAL_FIELDS.map((field) => (
              <div key={field.key} className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1">
                <span>{t(field.labelKey)}</span>
                <span className="font-semibold">{materialTotals[field.key] ?? 0}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
