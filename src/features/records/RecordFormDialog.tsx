import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ClinicRecord } from "@/types/clinic";
import { MATERIAL_FIELDS } from "@/features/records/constants";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  surname: z.string().min(1, "Surname is required"),
  mobile: z
    .string()
    .min(1, "Mobile is required")
    .regex(/^[+\d\s-]+$/, "Only +, digits, spaces, and - are allowed"),
  date: z.string().min(1, "Date is required"),
  money: z.coerce.number().min(0, "Money must be 0 or more"),
  keramika: z.coerce.number().int().min(0),
  tsirkoni: z.coerce.number().int().min(0),
  balka: z.coerce.number().int().min(0),
  plastmassi: z.coerce.number().int().min(0),
  shabloni: z.coerce.number().int().min(0),
  cisferi_plastmassi: z.coerce.number().int().min(0),
  notes: z.string().optional().nullable(),
});

export type RecordFormValues = z.infer<typeof schema>;

interface RecordFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ClinicRecord | null;
  onSubmit: (values: RecordFormValues) => Promise<boolean>;
}

export function RecordFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: RecordFormDialogProps) {
  const { t } = useI18n();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RecordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      surname: "",
      mobile: "",
      date: "",
      money: 0,
      keramika: 0,
      tsirkoni: 0,
      balka: 0,
      plastmassi: 0,
      shabloni: 0,
      cisferi_plastmassi: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: initialData?.name ?? "",
        surname: initialData?.surname ?? "",
        mobile: initialData?.mobile ?? "",
        date: initialData?.date ?? "",
        money: initialData?.money ?? 0,
        keramika: initialData?.keramika ?? 0,
        tsirkoni: initialData?.tsirkoni ?? 0,
        balka: initialData?.balka ?? 0,
        plastmassi: initialData?.plastmassi ?? 0,
        shabloni: initialData?.shabloni ?? 0,
        cisferi_plastmassi: initialData?.cisferi_plastmassi ?? 0,
        notes: initialData?.notes ?? "",
      });
    }
  }, [open, initialData, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{initialData ? t("editRecordTitle") : t("addRecordTitle")}</DialogTitle>
          <DialogDescription>
            {initialData ? t("editRecordHint") : t("addRecordHint")}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (values) => {
            const success = await onSubmit(values);
            if (success) {
              onOpenChange(false);
            }
          })}
          className="space-y-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t("name")}</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="surname">{t("surname")}</Label>
              <Input id="surname" {...register("surname")} />
              {errors.surname && (
                <p className="text-xs text-destructive">{errors.surname.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">{t("mobile")}</Label>
              <Input id="mobile" {...register("mobile")} />
              {errors.mobile && (
                <p className="text-xs text-destructive">{errors.mobile.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">{t("date")}</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && (
                <p className="text-xs text-destructive">{errors.date.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="money">{t("money")}</Label>
              <Input id="money" type="number" step="0.01" {...register("money")} />
              {errors.money && (
                <p className="text-xs text-destructive">{errors.money.message}</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold">{t("materialsProcedures")}</h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MATERIAL_FIELDS.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>{t(field.labelKey)}</Label>
                  <Input
                    id={field.key}
                    type="number"
                    min={0}
                    {...register(field.key)}
                  />
                  {(errors as Record<string, any>)[field.key] && (
                    <p className="text-xs text-destructive">Must be 0 or more</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("notes")}</Label>
            <Textarea id="notes" {...register("notes")} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {initialData ? t("saveChanges") : t("createRecord")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
