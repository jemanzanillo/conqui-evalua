import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listParticipantes,
  addParticipante,
  removeParticipante,
} from "@/server/participantes.functions";
import type { Participante } from "@/lib/storage";

const KEY = ["participantes"] as const;

export type NuevoParticipanteInput = {
  nombre: string;
  club: string | null;
  zona: number | null;
  orden: number | null;
};

export function useParticipantes() {
  const qc = useQueryClient();
  const query = useQuery<Participante[]>({
    queryKey: KEY,
    queryFn: () => listParticipantes(),
  });

  const addMut = useMutation({
    mutationFn: (input: NuevoParticipanteInput) => addParticipante({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => removeParticipante({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return {
    participantes: query.data ?? [],
    isLoading: query.isLoading,
    add: (input: NuevoParticipanteInput) => addMut.mutateAsync(input),
    remove: (id: string) => removeMut.mutateAsync(id),
  };
}
