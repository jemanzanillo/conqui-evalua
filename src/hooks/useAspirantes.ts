import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listAspirantes,
  addAspirante,
  removeAspirante,
} from "@/server/aspirantes.functions";
import type { Aspirante } from "@/lib/storage";

const KEY = ["aspirantes"] as const;

export function useAspirantes() {
  const qc = useQueryClient();
  const query = useQuery<Aspirante[]>({
    queryKey: KEY,
    queryFn: () => listAspirantes(),
  });

  const addMut = useMutation({
    mutationFn: (nombre: string) => addAspirante({ data: { nombre } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => removeAspirante({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return {
    aspirantes: query.data ?? [],
    isLoading: query.isLoading,
    add: (nombre: string) => addMut.mutateAsync(nombre),
    remove: (id: string) => removeMut.mutateAsync(id),
  };
}
