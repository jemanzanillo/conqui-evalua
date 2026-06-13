import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Eye, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { listResultadosPublicos } from "@/server/resultados.functions";
import { CRITERIOS } from "@/data/criterios";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/resultados")({
  component: ResultadosPage,
});

const medalla: Record<number, string> = {
  0: "🥇",
  1: "🥈",
  2: "🥉",
};

function ResultadosPage() {
  const {
    data: resultados = [],
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["resultados-publicos"],
    queryFn: () => listResultadosPublicos(),
    refetchInterval: 15_000,
  });

  const [abierto, setAbierto] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-tight">Resultados en vivo</h1>
              <p className="text-xs text-muted-foreground">Concurso de Predicación</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                <Eye className="h-3 w-3" />
                Solo lectura
              </span>
              <button
                type="button"
                onClick={() => refetch()}
                aria-label="Actualizar"
                className="rounded-md p-2 text-muted-foreground hover:bg-muted"
              >
                <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-2 px-4 py-4">
        {isLoading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Cargando…</p>
        ) : resultados.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Aún no hay participantes registrados.
          </p>
        ) : (
          resultados.map((r, i) => {
            const open = abierto === r.id;
            return (
              <Card key={r.id} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setAbierto(open ? null : r.id)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {medalla[i] ?? i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{r.nombre}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {r.zona ? `Zona ${r.zona}` : ""}
                      {r.zona && r.club ? " · " : ""}
                      {r.club ?? ""}
                      {!r.zona && !r.club ? "—" : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xl font-bold tabular-nums">{r.totalGeneral}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {r.juecesCalificaron} {r.juecesCalificaron === 1 ? "juez" : "jueces"}
                    </p>
                  </div>
                  {open ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </button>
                {open && (
                  <div className="border-t bg-muted/30 px-4 py-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Suma por criterio (todos los jueces)
                    </p>
                    <ul className="space-y-1">
                      {CRITERIOS.map((c) => (
                        <li key={c.id} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{c.titulo}</span>
                          <span className="tabular-nums">
                            {r.porCriterio[c.id] ?? 0}
                            <span className="text-muted-foreground">
                              {" "}
                              / {c.puntosMax * Math.max(r.juecesCalificaron, 1)}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </main>
    </div>
  );
}
