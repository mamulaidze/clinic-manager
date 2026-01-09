import { useEffect, useMemo, useRef, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, FileText, Pencil, Trash2, Copy } from "lucide-react";
import type { ClinicRecord } from "@/types/clinic";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, formatMoney } from "@/lib/formatters";
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
import { useI18n } from "@/lib/i18n";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function formatCustomMaterials(
  items: ClinicRecord["custom_materials"]
) {
  if (!items || items.length === 0) return "-";
  return items
    .filter((item) => item.name.trim())
    .map((item) => `${item.name}: ${item.qty}`)
    .join(", ") || "-";
}

function NotesCell({ value }: { value: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  if (!value) {
    return <span className="text-muted-foreground">-</span>;
  }
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="relative z-10 max-w-[160px] truncate text-left text-muted-foreground hover:text-foreground pointer-events-auto"
              onClick={(event) => {
                event.stopPropagation();
                setOpen(true);
              }}
              title={value}
            >
              {value}
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-[240px] whitespace-pre-wrap">
            {value}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("notes")}</DialogTitle>
          </DialogHeader>
          <div className="whitespace-pre-wrap text-sm text-muted-foreground">
            {value}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface RecordsTableProps {
  data: ClinicRecord[];
  onEdit: (record: ClinicRecord) => void;
  onDelete: (record: ClinicRecord) => void;
  onPdf: (record: ClinicRecord) => void;
  onCopy: (record: ClinicRecord) => void;
  onSelectionChange?: (records: ClinicRecord[]) => void;
  clearSelectionSignal?: number;
  pdfLoadingId?: string | null;
}

export function RecordsTable({
  data,
  onEdit,
  onDelete,
  onPdf,
  onCopy,
  onSelectionChange,
  clearSelectionSignal,
  pdfLoadingId,
}: RecordsTableProps) {
  const { lang, t } = useI18n();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const columns = useMemo<ColumnDef<ClinicRecord>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={table.getIsAllPageRowsSelected()}
              ref={(el) => {
                if (el) {
                  el.indeterminate = table.getIsSomePageRowsSelected();
                }
              }}
              onChange={(event) =>
                table.toggleAllPageRowsSelected(event.target.checked)
              }
              aria-label="Select all"
              className="h-4 w-4 cursor-pointer accent-primary"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              onChange={(event) => row.toggleSelected(event.target.checked)}
              aria-label="Select row"
              className="h-4 w-4 cursor-pointer accent-primary"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: t("name"),
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "surname",
        header: t("surname"),
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "mobile",
        header: t("mobile"),
      },
      {
        accessorKey: "date",
        header: ({ column }) => (
          <button
            type="button"
            className="-ml-3 inline-flex h-9 items-center gap-1 rounded-md px-2 text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground focus-visible:outline-none"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("date")}
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: ({ row }) =>
          formatDate(
            String(row.getValue("date")),
            lang === "ka" ? "ka-GE" : "en-US"
          ),
      },
      {
        accessorKey: "money",
        header: ({ column }) => (
          <button
            type="button"
            className="-ml-3 inline-flex h-9 items-center gap-1 rounded-md px-2 text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground focus-visible:outline-none"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("money")}
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: ({ row }) =>
          formatMoney(
            Number(row.getValue("money")),
            lang === "ka" ? "ka-GE" : "en-US"
          ),
      },
      { accessorKey: "keramika", header: t("materialKeramika") },
      { accessorKey: "tsirkoni", header: t("materialTsirkoni") },
      { accessorKey: "balka", header: t("materialBalka") },
      { accessorKey: "plastmassi", header: t("materialPlastmassi") },
      { accessorKey: "shabloni", header: t("materialShabloni") },
      {
        accessorKey: "cisferi_plastmassi",
        header: t("materialCisferiPlastmassi"),
      },
      {
        accessorKey: "custom_materials",
        header: t("customMaterials"),
        cell: ({ row }) =>
          formatCustomMaterials(row.original.custom_materials),
      },
      {
        accessorKey: "notes",
        header: t("notes"),
        cell: ({ row }) => {
          const value = String(row.getValue("notes") || "");
          return <NotesCell value={value} />;
        },
      },
      {
        id: "actions",
        header: t("actions"),
        enableHiding: false,
        cell: ({ row }) => {
          const record = row.original;
          return (
            <div
              className="relative z-10 flex items-center gap-2 pointer-events-auto"
              data-action-cell
            >
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/60 hover:text-foreground focus-visible:outline-none"
                onClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  onEdit(record);
                }}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/60 hover:text-foreground focus-visible:outline-none disabled:opacity-50"
                onClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  onPdf(record);
                }}
                disabled={pdfLoadingId === record.id}
              >
                <FileText className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/60 hover:text-foreground focus-visible:outline-none"
                onClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  onCopy(record);
                }}
              >
                <Copy className="h-4 w-4" />
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/60 hover:text-foreground focus-visible:outline-none"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
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
                    <AlertDialogAction
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(record);
                      }}
                    >
                      {t("delete")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          );
        },
      },
    ],
    [onEdit, onDelete, onPdf, onCopy]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility, rowSelection, pagination },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selectedRecords = useMemo(() => {
    return table.getSelectedRowModel().rows.map((row) => row.original);
  }, [table, rowSelection, data]);

  const lastSelectionRef = useRef<string>("");

  useEffect(() => {
    if (!onSelectionChange) return;
    const next = selectedRecords.map((record) => record.id).join("|");
    if (next === lastSelectionRef.current) return;
    lastSelectionRef.current = next;
    onSelectionChange(selectedRecords);
  }, [onSelectionChange, selectedRecords]);

  useEffect(() => {
    if (typeof clearSelectionSignal === "number") {
      setRowSelection({});
    }
  }, [clearSelectionSignal]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          {data.length} {t("records")}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {t("columns")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("toggleColumns")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-xl border bg-card overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="bg-card">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b data-[state=selected]:bg-muted"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4 align-middle">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr className="border-b">
                <td colSpan={columns.length} className="h-24 text-center">
                  {t("noRecords")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          {t("page")} {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{t("pageSize")}</span>
          <select
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            value={table.getState().pagination.pageSize}
            onChange={(event) => table.setPageSize(Number(event.target.value))}
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {t("previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {t("next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
