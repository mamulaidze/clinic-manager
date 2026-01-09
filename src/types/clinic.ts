export interface ClinicRecord {
  id: string;
  user_id: string;
  name: string;
  surname: string;
  mobile: string;
  date: string;
  money: number;
  keramika: number;
  tsirkoni: number;
  balka: number;
  plastmassi: number;
  shabloni: number;
  cisferi_plastmassi: number;
  custom_materials: { name: string; qty: number }[] | null;
  notes: string | null;
  created_at: string;
}

export type ClinicRecordInput = Omit<ClinicRecord, "id" | "created_at" | "user_id"> & {
  id?: string;
};
