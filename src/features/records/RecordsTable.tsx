import { useEffect, useMemo, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatMoney } from "@/lib/formatters";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useI18n } from "@/lib/i18n";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
              onPointerDown={(event) => {
                event.stopPropagation();
                event.preventDefault();
                setOpen(true);
              }}
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
}

export function RecordsTable({
  data,
  onEdit,
  onDelete,
  onPdf,
  onCopy,
  onSelectionChange,
  clearSelectionSignal,
}: RecordsTableProps) {
  const { lang, t } = useI18n();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const columns = useMemo<ColumnDef<ClinicRecord>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
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
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("date")}
            <ArrowUpDown className="h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => formatDate(String(row.getValue("date")), lang === "ka" ? "ka-GE" : "en-US"),
      },
      {
        accessorKey: "money",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("money")}
            <ArrowUpDown className="h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => formatMoney(Number(row.getValue("money")), lang === "ka" ? "ka-GE" : "en-US"),
      },
      { accessorKey: "keramika", header: t("materialKeramika") },
      { accessorKey: "tsirkoni", header: t("materialTsirkoni") },
      { accessorKey: "balka", header: t("materialBalka") },
      { accessorKey: "plastmassi", header: t("materialPlastmassi") },
      { accessorKey: "shabloni", header: t("materialShabloni") },
      { accessorKey: "cisferi_plastmassi", header: t("materialCisferiPlastmassi") },
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
              <Button
                variant="ghost"
                size="icon"
                className="pointer-events-auto"
                onPointerDown={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  onEdit(record);
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  onEdit(record);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="pointer-events-auto"
                onPointerDown={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  onPdf(record);
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  onPdf(record);
                }}
              >
                <FileText className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="pointer-events-auto"
                onPointerDown={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  onCopy(record);
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  onCopy(record);
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="pointer-events-auto"
                    onClick={(event) => {
                      event.stopPropagation();
                      event.preventDefault();
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
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
                    <AlertDialogAction onClick={() => onDelete(record)}>
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
    state: { sorting, columnVisibility, rowSelection },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selectedRecords = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedRecords);
    }
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

      <div className="rounded-xl border bg-white/70">
        <Table>
          <TableHeader className="sticky top-0 bg-white/80 backdrop-blur">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="sticky top-0 bg-white/90 backdrop-blur">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t("noRecords")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {t("page")} {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
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
