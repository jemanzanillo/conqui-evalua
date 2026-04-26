import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listAspirantes,
  addAspirante,
  removeAspirante,
} from "@/server/aspirantes.functions";
import type { Aspirante } from "@/lib/storage";

const KEY = ["aspirantes"] as const;

export type NuevoAspiranteInput = {
  nombre: string;
  zona: number | null;
  club: string | null;
};

export function useAspirantes() {
  const qc = useQueryClient();
  const query = useQuery<Aspirante[]>({
    queryKey: KEY,
    queryFn: () => listAspirantes(),
  });

  const addMut = useMutation({
    mutationFn: (input: NuevoAspiranteInput) => addAspirante({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => removeAspirante({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return {
    aspirantes: query.data ?? [],
    isLoading: query.isLoading,
    add: (input: NuevoAspiranteInput) => addMut.mutateAsync(input),
    remove: (id: string) => removeMut.mutateAsync(id),
  };
}
