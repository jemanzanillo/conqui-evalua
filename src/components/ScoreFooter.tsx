import { porcentaje, semaforo, semaforoLabel, type SemaforoEstado } from "@/lib/scoring";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Props = {
  obtenidos: number;
  total: number;
  faseLabel?: string;
};

const colorClasses: Record<SemaforoEstado, { chip: string; dot: string; bar: string }> = {
  rojo: {
    chip: "bg-red-500/15 text-red-700 dark:text-red-400",
    dot: "bg-red-500",
    bar: "[&>div]:bg-red-500",
  },
  amarillo: {
    chip: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
    dot: "bg-yellow-500",
    bar: "[&>div]:bg-yellow-500",
  },
  verde: {
    chip: "bg-green-500/15 text-green-700 dark:text-green-400",
    dot: "bg-green-500",
    bar: "[&>div]:bg-green-500",
  },
};

export function ScoreFooter({ obtenidos, total, faseLabel }: Props) {
  const pct = porcentaje(obtenidos, total);
  const estado = semaforo(pct);
  const cls = colorClasses[estado];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto max-w-3xl px-4 py-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums">{obtenidos}</span>
            <span className="text-sm text-muted-foreground">/ {total} pts</span>
            {faseLabel && (
              <span className="ml-1 text-xs text-muted-foreground">· {faseLabel}</span>
            )}
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
              cls.chip,
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", cls.dot)} />
            {semaforoLabel(estado)} · {pct}%
          </div>
        </div>
        <Progress value={pct} className={cn("h-2", cls.bar)} />
      </div>
    </div>
  );
}
