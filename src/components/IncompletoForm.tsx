import { Textarea } from "@/components/ui/textarea";
import { MOTIVOS_INCOMPLETO } from "@/data/requisitos";
import { cn } from "@/lib/utils";

type Props = {
  motivo?: string;
  comentario?: string;
  onChange: (patch: { motivo?: string; comentario?: string }) => void;
};

export function IncompletoForm({ motivo, comentario, onChange }: Props) {
  return (
    <div className="mt-3 space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Motivo</p>
        <div className="flex flex-wrap gap-2">
          {MOTIVOS_INCOMPLETO.map((m) => {
            const active = motivo === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => onChange({ motivo: active ? undefined : m })}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-destructive bg-destructive text-destructive-foreground"
                    : "border-border bg-background hover:bg-muted",
                )}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Comentario</p>
        <Textarea
          value={comentario ?? ""}
          onChange={(e) => onChange({ comentario: e.target.value })}
          placeholder="Detalle breve para el aspirante…"
          className="min-h-[60px]"
        />
      </div>
    </div>
  );
}
