export interface UserSettings {
  id: string;
  user_id: string;
  show_summary: boolean;
  show_filters: boolean;
  show_table: boolean;
  created_at: string;
  updated_at: string;
}

export type UserSettingsInput = Omit<UserSettings, "id" | "created_at" | "updated_at" | "user_id"> & {
  id?: string;
};