import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { CriterioGuiaSheet } from "./CriterioGuiaSheet";
import type { Criterio } from "@/data/criterios";
import { cn } from "@/lib/utils";

type Props = {
  criterio: Criterio;
  valor: number;
  disabled?: boolean;
  onChange: (valor: number) => void;
};

export function CriterioCard({ criterio, valor, disabled, onChange }: Props) {
  const pct = criterio.puntosMax === 0 ? 0 : (valor / criterio.puntosMax) * 100;

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-snug">{criterio.titulo}</h3>
          {criterio.descripcion && (
            <p className="mt-1 text-xs text-muted-foreground">{criterio.descripcion}</p>
          )}
        </div>
        <CriterioGuiaSheet criterio={criterio} />
      </div>

      <div className="flex items-center gap-3">
        <Slider
          value={[valor]}
          min={0}
          max={criterio.puntosMax}
          step={1}
          disabled={disabled}
          onValueChange={([v]) => onChange(v)}
          className={cn(disabled && "opacity-60")}
        />
        <div className="w-16 shrink-0 text-right">
          <span className="text-lg font-bold tabular-nums">{valor}</span>
          <span className="text-xs text-muted-foreground"> / {criterio.puntosMax}</span>
        </div>
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </Card>
  );
}
