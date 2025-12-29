export function formatMoney(value: number, locale: "ka-GE" | "en-US" = "ka-GE") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "GEL",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(value: string, locale: "ka-GE" | "en-US" = "ka-GE") {
  if (!value) return "";
  const date = new Date(value);
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

export function toIsoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}
