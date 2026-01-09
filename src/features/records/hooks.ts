import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { ClinicRecord, ClinicRecordInput } from "@/types/clinic";
import type { Preset, PresetInput } from "@/types/preset";
import type { UserSettings, UserSettingsInput } from "@/types/settings";

async function fetchRecords(userId?: string | null) {
  const query = supabase
    .from("clinic_records")
    .select("*")
    .order("date", { ascending: false });

  if (userId) {
    query.eq("user_id", userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as ClinicRecord[];
}

export function useRecordsQuery() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["records", user?.id],
    queryFn: () => fetchRecords(user?.id),
    enabled: !!user,
  });
}

export function useRecordMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createRecord = useMutation({
    mutationFn: async (payload: ClinicRecordInput) => {
      const { data, error } = await supabase
        .from("clinic_records")
        .insert({ ...payload, user_id: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data as ClinicRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
  });

  const updateRecord = useMutation({
    mutationFn: async (payload: ClinicRecord) => {
      const { data, error } = await supabase
        .from("clinic_records")
        .update(payload)
        .eq("id", payload.id)
        .select()
        .single();
      if (error) throw error;
      return data as ClinicRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
  });

  const deleteRecord = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clinic_records").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
  });

  return { createRecord, updateRecord, deleteRecord };
}

async function fetchPresets(userId?: string | null) {
  const query = supabase
    .from("clinic_presets")
    .select("*")
    .order("created_at", { ascending: false });

  if (userId) {
    query.eq("user_id", userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Preset[];
}

export function usePresetsQuery() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["presets", user?.id],
    queryFn: () => fetchPresets(user?.id),
    enabled: !!user,
  });
}

export function usePresetMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createPreset = useMutation({
    mutationFn: async (payload: PresetInput) => {
      const { data, error } = await supabase
        .from("clinic_presets")
        .insert({ ...payload, user_id: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data as Preset;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presets"] });
    },
  });

  const updatePreset = useMutation({
    mutationFn: async (payload: Preset) => {
      const { data, error } = await supabase
        .from("clinic_presets")
        .update(payload)
        .eq("id", payload.id)
        .select()
        .single();
      if (error) throw error;
      return data as Preset;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presets"] });
    },
  });

  const deletePreset = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clinic_presets").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presets"] });
    },
  });

  return { createPreset, updatePreset, deletePreset };
}

async function fetchSettings(userId?: string | null) {
  const { data, error } = await supabase
    .from("clinic_user_settings")
    .select("*")
    .eq("user_id", userId ?? "")
    .maybeSingle();
  if (error) throw error;
  return data as UserSettings | null;
}

export function useUserSettingsQuery() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["settings", user?.id],
    queryFn: () => fetchSettings(user?.id),
    enabled: !!user,
  });
}

export function useUserSettingsMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (payload: UserSettingsInput) => {
      const { data, error } = await supabase
        .from("clinic_user_settings")
        .upsert({ ...payload, user_id: user?.id }, { onConflict: "user_id" })
        .select()
        .single();
      if (error) throw error;
      return data as UserSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}
