import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Send } from "lucide-react";
import { porcentaje } from "@/lib/scoring";

type Props = {
  total: number;
  max: number;
  estado: "pendiente" | "enviado";
  submittedAt?: string | null;
  onSubmit: () => void;
  isSubmitting?: boolean;
};

export function PuntajeFooter({ total, max, estado, submittedAt, onSubmit, isSubmitting }: Props) {
  const pct = porcentaje(total, max);
  const enviado = estado === "enviado";

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto max-w-3xl px-4 py-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums">{total}</span>
            <span className="text-sm text-muted-foreground">/ {max} pts</span>
            <span className="ml-1 text-xs text-muted-foreground">· {pct}%</span>
          </div>
          {enviado ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-2.5 py-1 text-xs font-semibold text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Enviado{submittedAt ? ` · ${formatFecha(submittedAt)}` : ""}
            </span>
          ) : (
            <Button size="sm" onClick={onSubmit} disabled={isSubmitting} className="gap-1.5">
              <Send className="h-3.5 w-3.5" />
              {isSubmitting ? "Enviando…" : "Enviar calificación"}
            </Button>
          )}
        </div>
        <Progress value={pct} className="h-2" />
        {enviado && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Calificación enviada. Si necesitas corregirla, pide al Coordinador que la reabra.
          </p>
        )}
      </div>
    </div>
  );
}

function formatFecha(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
