import { useEffect } from "react";
import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
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
  custom_materials: z
    .array(
      z.object({
        name: z.string().min(1, "Name is required"),
        qty: z.coerce.number().int().min(0),
      })
    )
    .default([]),
  notes: z.string().optional().nullable(),
});

export type RecordFormValues = z.infer<typeof schema>;

const EMPTY_VALUES: RecordFormValues = {
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
  custom_materials: [],
  notes: "",
};

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
    control,
  } = useForm<RecordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
  });
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "custom_materials",
  });

  useEffect(() => {
    if (open) {
      const nextCustomMaterials = initialData?.custom_materials ?? [];
      replace(nextCustomMaterials);
      reset({
        name: initialData?.name ?? EMPTY_VALUES.name,
        surname: initialData?.surname ?? EMPTY_VALUES.surname,
        mobile: initialData?.mobile ?? EMPTY_VALUES.mobile,
        date: initialData?.date ?? EMPTY_VALUES.date,
        money: initialData?.money ?? EMPTY_VALUES.money,
        keramika: initialData?.keramika ?? EMPTY_VALUES.keramika,
        tsirkoni: initialData?.tsirkoni ?? EMPTY_VALUES.tsirkoni,
        balka: initialData?.balka ?? EMPTY_VALUES.balka,
        plastmassi: initialData?.plastmassi ?? EMPTY_VALUES.plastmassi,
        shabloni: initialData?.shabloni ?? EMPTY_VALUES.shabloni,
        cisferi_plastmassi:
          initialData?.cisferi_plastmassi ??
          EMPTY_VALUES.cisferi_plastmassi,
        custom_materials: nextCustomMaterials,
        notes: initialData?.notes ?? EMPTY_VALUES.notes,
      });
      return;
    }
    replace([]);
    reset(EMPTY_VALUES);
  }, [open, initialData, reset, replace]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] w-[95vw] max-w-3xl overflow-y-auto">
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

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold">{t("customMaterials")}</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", qty: 0 })}
              >
                {t("addCustomMaterial")}
              </Button>
            </div>
            {fields.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                {t("customMaterialsHint")}
              </p>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid gap-3 sm:grid-cols-5">
                    <div className="space-y-2 sm:col-span-3">
                      <Label htmlFor={`custom_materials.${index}.name`}>
                        {t("customMaterialName")}
                      </Label>
                      <Input
                        id={`custom_materials.${index}.name`}
                        {...register(`custom_materials.${index}.name` as const)}
                      />
                      {errors.custom_materials?.[index]?.name && (
                        <p className="text-xs text-destructive">
                          {errors.custom_materials[index]?.name?.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 sm:col-span-1">
                      <Label htmlFor={`custom_materials.${index}.qty`}>
                        {t("customMaterialQty")}
                      </Label>
                      <Input
                        id={`custom_materials.${index}.qty`}
                        type="number"
                        min={0}
                        {...register(`custom_materials.${index}.qty` as const)}
                      />
                      {errors.custom_materials?.[index]?.qty && (
                        <p className="text-xs text-destructive">Must be 0 or more</p>
                      )}
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={() => remove(index)}
                      >
                        {t("delete")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
