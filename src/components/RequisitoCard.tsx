import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Requisito } from "@/data/requisitos";
import type { EvaluacionRequisito } from "@/lib/storage";
import { isCompletado } from "@/lib/scoring";
import { IncompletoForm } from "./IncompletoForm";
import { RequisitoGuiaSheet } from "./RequisitoGuiaSheet";
import { Check, Circle, X } from "lucide-react";

type Props = {
  requisito: Requisito;
  evaluacion?: EvaluacionRequisito;
  faseLabel: string;
  onChange: (patch: Partial<EvaluacionRequisito>) => void;
};

export function RequisitoCard({ requisito, evaluacion, faseLabel, onChange }: Props) {
  const ev = evaluacion ?? { estado: "pendiente" as const };
  const completado = isCompletado(requisito, ev);
  const incompleto = ev.estado === "incompleto";

  return (
    <Card
      className={cn(
        "p-4 transition-colors",
        completado && "border-green-500/50 bg-green-500/5",
        incompleto && "border-destructive/50 bg-destructive/5",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-snug">{requisito.titulo}</h3>
          {requisito.descripcion && (
            <p className="mt-1 text-xs text-muted-foreground">{requisito.descripcion}</p>
          )}
        </div>
        <RequisitoGuiaSheet requisito={requisito} faseLabel={faseLabel} />
      </div>

      {requisito.tipo === "simple" ? (
        <SegmentedSimple
          estado={ev.estado}
          onChange={(estado) => onChange({ estado })}
        />
      ) : (
        <SeleccionList
          opciones={requisito.opciones}
          min={requisito.min}
          seleccionados={ev.seleccionados ?? []}
          onChange={(sel) =>
            onChange({
              seleccionados: sel,
              estado: sel.length >= requisito.min ? "completado" : "pendiente",
            })
          }
        />
      )}

      {incompleto && (
        <IncompletoForm
          motivo={ev.motivo}
          comentario={ev.comentario}
          onChange={(patch) => onChange(patch)}
        />
      )}
    </Card>
  );
}

function SegmentedSimple({
  estado,
  onChange,
}: {
  estado: EvaluacionRequisito["estado"];
  onChange: (e: EvaluacionRequisito["estado"]) => void;
}) {
  const items = [
    { id: "pendiente" as const, label: "Pendiente", icon: Circle },
    { id: "completado" as const, label: "Completado", icon: Check },
    { id: "incompleto" as const, label: "Incompleto", icon: X },
  ];
  return (
    <div className="grid grid-cols-3 gap-1.5 rounded-lg bg-muted p-1">
      {items.map((it) => {
        const active = estado === it.id;
        const Icon = it.icon;
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onChange(it.id)}
            className={cn(
              "flex min-h-[44px] items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium transition-all",
              active && it.id === "completado" && "bg-green-500 text-white shadow-sm",
              active && it.id === "incompleto" && "bg-destructive text-destructive-foreground shadow-sm",
              active && it.id === "pendiente" && "bg-background text-foreground shadow-sm",
              !active && "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function SeleccionList({
  opciones,
  min,
  seleccionados,
  onChange,
}: {
  opciones: { id: string; label: string }[];
  min: number;
  seleccionados: string[];
  onChange: (sel: string[]) => void;
}) {
  const toggle = (id: string) => {
    onChange(
      seleccionados.includes(id)
        ? seleccionados.filter((x) => x !== id)
        : [...seleccionados, id],
    );
  };
  const cumplido = seleccionados.length >= min;

  return (
    <div>
      <div
        className={cn(
          "mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
          cumplido ? "bg-green-500/15 text-green-700 dark:text-green-400" : "bg-muted text-muted-foreground",
        )}
      >
        {cumplido && <Check className="h-3 w-3" />}
        {seleccionados.length}/{min} seleccionados
      </div>
      <div className="space-y-1">
        {opciones.map((op) => {
          const checked = seleccionados.includes(op.id);
          return (
            <label
              key={op.id}
              className={cn(
                "flex min-h-[44px] cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors",
                checked ? "border-green-500/50 bg-green-500/5" : "border-border hover:bg-muted",
              )}
            >
              <Checkbox
                checked={checked}
                onCheckedChange={() => toggle(op.id)}
              />
              <span className="flex-1">{op.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
