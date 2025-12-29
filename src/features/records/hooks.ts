import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { ClinicRecord, ClinicRecordInput } from "@/types/clinic";

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