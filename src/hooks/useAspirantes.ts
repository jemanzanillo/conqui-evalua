import { useCallback, useEffect, useState } from "react";
import { storage, type Aspirante } from "@/lib/storage";

export function useAspirantes() {
  const [aspirantes, setAspirantes] = useState<Aspirante[]>([]);

  useEffect(() => {
    setAspirantes(storage.listAspirantes());
  }, []);

  const add = useCallback((nombre: string) => {
    const a = storage.addAspirante(nombre);
    setAspirantes(storage.listAspirantes());
    return a;
  }, []);

  const remove = useCallback((id: string) => {
    storage.removeAspirante(id);
    setAspirantes(storage.listAspirantes());
  }, []);

  return { aspirantes, add, remove };
}
