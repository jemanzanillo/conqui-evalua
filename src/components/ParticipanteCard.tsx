import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Trash2 } from "lucide-react";
import { getCalificacion } from "@/server/calificaciones.functions";
import { totalCalificacion, PUNTAJE_MAXIMO } from "@/lib/scoring";
import type { Participante } from "@/lib/storage";
import { cn } from "@/lib/utils";

type Props = {
  participante: Participante;
  canRemove: boolean;
  onRemove: (id: string) => void;
};

export function ParticipanteCard({ participante, canRemove, onRemove }: Props) {
  const { data: calificacion } = useQuery({
    queryKey: ["calificacion", participante.id],
    queryFn: () => getCalificacion({ data: { participanteId: participante.id } }),
    staleTime: 10_000,
  });

  const enviado = calificacion?.estado === "enviado";
  const total = calificacion ? totalCalificacion(calificacion.puntos) : 0;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 p-4">
        <Link
          to="/participante/$id"
          params={{ id: participante.id }}
          className="flex flex-1 items-center gap-3 min-w-0"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
            {participante.orden ?? participante.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{participante.nombre}</p>
            {(participante.zona || participante.club) && (
              <p className="truncate text-[11px] text-muted-foreground">
                {participante.zona ? `Zona ${participante.zona}` : ""}
                {participante.zona && participante.club ? " · " : ""}
                {participante.club ?? ""}
              </p>
            )}
            <div className="mt-1">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  enviado
                    ? "bg-green-500/15 text-green-700 dark:text-green-400"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {enviado ? `Enviado · ${total}/${PUNTAJE_MAXIMO}` : "Pendiente"}
              </span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </Link>
        {canRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm(`¿Eliminar a ${participante.nombre}?`)) onRemove(participante.id);
            }}
            aria-label="Eliminar participante"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>
    </Card>
  );
}
