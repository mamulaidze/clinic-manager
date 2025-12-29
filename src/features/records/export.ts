import type { ClinicRecord } from "@/types/clinic";

export function exportCsv(records: ClinicRecord[]) {
  const escapeValue = (value: string | number) => {
    const text = String(value ?? "");
    if (/[",\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };
  const headers = [
    "name",
    "surname",
    "mobile",
    "date",
    "money",
    "keramika",
    "tsirkoni",
    "balka",
    "plastmassi",
    "shabloni",
    "cisferi_plastmassi",
    "notes",
  ];

  const rows = records.map((record) => [
    record.name,
    record.surname,
    record.mobile,
    record.date,
    record.money,
    record.keramika,
    record.tsirkoni,
    record.balka,
    record.plastmassi,
    record.shabloni,
    record.cisferi_plastmassi,
    record.notes ?? "",
  ]);

  const csv = [
    headers.map(escapeValue).join(","),
    ...rows.map((row) => row.map(escapeValue).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `clinic_records_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
