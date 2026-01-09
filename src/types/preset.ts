export interface Preset {
  id: string;
  user_id: string;
  name: string;
  search: string;
  date_from: string | null;
  date_to: string | null;
  created_at: string;
}

export type PresetInput = Omit<Preset, "id" | "created_at" | "user_id"> & {
  id?: string;
};