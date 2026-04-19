import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Trash2 } from "lucide-react";
import { FASES } from "@/data/requisitos";
import { puntajeFase, semaforo, porcentaje, type SemaforoEstado } from "@/lib/scoring";
import { storage, type Aspirante } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const faseColor: Record<string, string> = {
  "EVA-1": "bg-orange-500",
  "EVA-2": "bg-green-500",
  "EVA-3": "bg-blue-500",
};

const semaforoText: Record<SemaforoEstado, string> = {
  rojo: "text-red-600 dark:text-red-400",
  amarillo: "text-yellow-700 dark:text-yellow-400",
  verde: "text-green-700 dark:text-green-400",
};

type Props = {
  aspirante: Aspirante;
  onRemove: (id: string) => void;
};

export function AspiranteCard({ aspirante, onRemove }: Props) {
  const ev = useMemo(() => storage.getEvaluacion(aspirante.id), [aspirante.id]);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 p-4">
        <Link
          to="/aspirante/$id"
          params={{ id: aspirante.id }}
          className="flex flex-1 items-center gap-3 min-w-0"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
            {aspirante.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{aspirante.nombre}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {FASES.map((f) => {
                const { obtenidos, total } = puntajeFase(f, ev);
                const pct = porcentaje(obtenidos, total);
                const est = semaforo(pct);
                return (
                  <span
                    key={f.id}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium"
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", faseColor[f.id])} />
                    <span>{f.id}</span>
                    <span className={cn("tabular-nums", semaforoText[est])}>
                      {obtenidos}/{total}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (confirm(`¿Eliminar a ${aspirante.nombre}?`)) onRemove(aspirante.id);
          }}
          aria-label="Eliminar aspirante"
        >
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </Card>
  );
}
