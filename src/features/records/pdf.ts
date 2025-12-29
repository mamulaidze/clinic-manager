import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ClinicRecord } from "@/types/clinic";
import { formatDate, formatMoney } from "@/lib/formatters";
import { MATERIAL_FIELDS } from "@/features/records/constants";
import type { Language } from "@/lib/i18n";
import fontUrl from "@/assets/fonts/NotoSansGeorgian-VariableFont_wdth,wght.ttf?url";

const FONT_NAME = "NotoSansGeorgian";
let fontBase64Promise: Promise<string> | null = null;

async function loadFontBase64() {
  if (!fontBase64Promise) {
    fontBase64Promise = fetch(fontUrl)
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        let binary = "";
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i += 1) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
      });
  }
  return fontBase64Promise;
}

async function applyGeorgianFont(doc: jsPDF) {
  const base64 = await loadFontBase64();
  doc.addFileToVFS(`${FONT_NAME}.ttf`, base64);
  doc.addFont(`${FONT_NAME}.ttf`, FONT_NAME, "normal");
  doc.setFont(FONT_NAME);
}

export async function generateClientPdf(
  record: ClinicRecord,
  lang: Language,
  clinicName: string,
  managerName: string
) {
  const locale = lang === "ka" ? "ka-GE" : "en-US";
  const labels =
    lang === "ka"
      ? {
          receipt: clinicName || "Clinic",
          manager: managerName ? `მენეჯერი: ${managerName}` : "",
          client: "კლიენტი",
          mobile: "მობილური",
          date: "თარიღი",
          total: "ჯამი",
          materials: "მასალები / პროცედურები",
          count: "რაოდენობა",
          notes: "შენიშვნები",
        }
      : {
          receipt: clinicName || "Clinic",
          manager: managerName ? `Manager: ${managerName}` : "",
          client: "Client",
          mobile: "Mobile",
          date: "Date",
          total: "Total",
          materials: "Material / Procedure",
          count: "Count",
          notes: "Notes",
        };
  const doc = new jsPDF();
  await applyGeorgianFont(doc);
  doc.setFontSize(18);
  doc.text(labels.receipt, 14, 20);
  if (labels.manager) {
    doc.setFontSize(11);
    doc.text(labels.manager, 14, 28);
  }

  doc.setFontSize(12);
  const detailsStartY = labels.manager ? 38 : 32;
  doc.text(`${labels.client}: ${record.name} ${record.surname}`, 14, detailsStartY);
  doc.text(`${labels.mobile}: ${record.mobile}`, 14, detailsStartY + 8);
  doc.text(`${labels.date}: ${formatDate(record.date, locale)}`, 14, detailsStartY + 16);
  doc.text(`${labels.total}: ${formatMoney(record.money, locale)}`, 14, detailsStartY + 24);

  const items = MATERIAL_FIELDS.filter((item) => record[item.key] > 0).map(
    (item) => [
      lang === "ka"
        ? {
            materialKeramika: "კერამიკა",
            materialTsirkoni: "ცირკონი",
            materialBalka: "ბალკა",
            materialPlastmassi: "პლასტმასი",
            materialShabloni: "შაბლონი",
            materialCisferiPlastmassi: "ცისფერი პლასტმასი",
          }[item.labelKey]
        : {
            materialKeramika: "Keramika",
            materialTsirkoni: "Tsirkoni",
            materialBalka: "Balka",
            materialPlastmassi: "Plastmassi",
            materialShabloni: "Shabloni",
            materialCisferiPlastmassi: "Cisferi plastmassi",
          }[item.labelKey],
      String(record[item.key]),
    ]
  );

  if (items.length > 0) {
    autoTable(doc, {
      startY: detailsStartY + 30,
      head: [[labels.materials, labels.count]],
      body: items,
      theme: "striped",
      styles: { font: FONT_NAME, fontSize: 11 },
    });
  }

  if (record.notes) {
    const y = (doc as any).lastAutoTable?.finalY
      ? (doc as any).lastAutoTable.finalY + 10
      : detailsStartY + 38;
    doc.text(`${labels.notes}:`, 14, y);
    doc.setFontSize(11);
    doc.text(record.notes, 14, y + 8, { maxWidth: 180 });
  }

  const filename = `${record.name}_${record.surname}_${record.date}.pdf`;
  doc.save(filename);
}

export async function generateFilteredPdf(
  records: ClinicRecord[],
  lang: Language,
  clinicName: string,
  managerName: string
) {
  const locale = lang === "ka" ? "ka-GE" : "en-US";
  const headers =
    lang === "ka"
      ? [
          "სახელი",
          "გვარი",
          "მობილური",
          "თარიღი",
          "თანხა",
          "კერამიკა",
          "ცირკონი",
          "ბალკა",
          "პლასტმასი",
          "შაბლონი",
          "ცისფერი პლასტმასი",
          "შენიშვნები",
        ]
      : [
          "Name",
          "Surname",
          "Mobile",
          "Date",
          "Money",
          "Keramika",
          "Tsirkoni",
          "Balka",
          "Plastmassi",
          "Shabloni",
          "Cisferi plastmassi",
          "Notes",
        ];
  const doc = new jsPDF({ orientation: "landscape" });
  await applyGeorgianFont(doc);
  doc.setFontSize(16);
  const title =
    clinicName || (lang === "ka" ? "კლინიკის ანგარიში" : "Clinic report");
  doc.text(
    lang === "ka" ? `${title} ანგარიში` : `${title} report`,
    14,
    16
  );
  if (managerName) {
    doc.setFontSize(11);
    doc.text(
      lang === "ka" ? `მენეჯერი: ${managerName}` : `Manager: ${managerName}`,
      14,
      22
    );
  }

  const head = [headers];

  const body = records.map((record) => [
    record.name,
    record.surname,
    record.mobile,
    formatDate(record.date, locale),
    formatMoney(record.money, locale),
    String(record.keramika),
    String(record.tsirkoni),
    String(record.balka),
    String(record.plastmassi),
    String(record.shabloni),
    String(record.cisferi_plastmassi),
    record.notes ?? "",
  ]);

  autoTable(doc, {
    startY: managerName ? 28 : 24,
    head,
    body,
    styles: { font: FONT_NAME, fontSize: 9 },
    headStyles: { fillColor: [30, 79, 92] },
  });

  doc.save(`Clinic_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function getShareText(record: ClinicRecord, lang: Language) {
  const locale = lang === "ka" ? "ka-GE" : "en-US";
  const labelMap =
    lang === "ka"
      ? {
          materialKeramika: "კერამიკა",
          materialTsirkoni: "ცირკონი",
          materialBalka: "ბალკა",
          materialPlastmassi: "პლასტმასი",
          materialShabloni: "შაბლონი",
          materialCisferiPlastmassi: "ცისფერი პლასტმასი",
        }
      : {
          materialKeramika: "Keramika",
          materialTsirkoni: "Tsirkoni",
          materialBalka: "Balka",
          materialPlastmassi: "Plastmassi",
          materialShabloni: "Shabloni",
          materialCisferiPlastmassi: "Cisferi plastmassi",
        };

  const items = MATERIAL_FIELDS.filter((item) => record[item.key] > 0)
    .map((item) => `${labelMap[item.labelKey]}: ${record[item.key]}`)
    .join(", ");

  if (lang === "en") {
    return `Hello ${record.name} ${record.surname},\nYour visit details:\nDate: ${record.date}\nAmount: ${formatMoney(record.money, locale)}\n${
      items ? `Materials: ${items}` : ""
    }\n${record.notes ? `Note: ${record.notes}` : ""}`.trim();
  }

  return `გამარჯობა ${record.name} ${record.surname},\nთქვენი ვიზიტის დეტალები:\nთარიღი: ${record.date}\nთანხა: ${formatMoney(record.money, locale)}\n${
    items ? `მასალები: ${items}` : ""
  }\n${record.notes ? `შენიშვნა: ${record.notes}` : ""}`.trim();
}
