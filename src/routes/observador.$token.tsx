import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { type Fase } from "@/data/requisitos";
import {
  getAspiranteByToken,
  getEvaluacionByToken,
} from "@/server/observador.functions";
import { useFasesConOverrides } from "@/hooks/useFasesConOverrides";
import { puntajeFase, isCompletado } from "@/lib/scoring";
import { ScoreFooter } from "@/components/ScoreFooter";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const Route = createFileRoute("/observador/$token")({
  component: ObservadorPage,
});

const faseAccent: Record<Fase, { active: string; dot: string }> = {
  "EVA-1": {
    active: "data-[state=active]:bg-orange-500 data-[state=active]:text-white",
    dot: "bg-orange-500",
  },
  "EVA-2": {
    active: "data-[state=active]:bg-green-500 data-[state=active]:text-white",
    dot: "bg-green-500",
  },
  "EVA-3": {
    active: "data-[state=active]:bg-blue-500 data-[state=active]:text-white",
    dot: "bg-blue-500",
  },
};

function ObservadorPage() {
  const { token } = Route.useParams();

  const { data: aspirante, isLoading } = useQuery({
    queryKey: ["observador-aspirante", token],
    queryFn: () => getAspiranteByToken({ data: { token } }),
  });

  const { data: evaluacion = {} } = useQuery({
    queryKey: ["observador-evaluacion", token],
    queryFn: () => getEvaluacionByToken({ data: { token } }),
  });

  const { fases } = useFasesConOverrides();
  const [tab, setTab] = useState<Fase>("EVA-1");

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </div>
    );
  }
  if (!aspirante) throw notFound();

  const faseActual = fases.find((f) => f.id === tab)!;
  const { obtenidos, total } = puntajeFase(faseActual, evaluacion);

  return (
    <div className="min-h-screen bg-muted/30 pb-32">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-3 py-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
              <Eye className="h-3 w-3" />
              Solo lectura
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{aspirante.nombre}</p>
              <p className="truncate text-xs text-muted-foreground">
                {aspirante.zona ? `Zona ${aspirante.zona}` : ""}
                {aspirante.zona && aspirante.club ? " · " : ""}
                {aspirante.club ?? ""}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-3 py-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Fase)}>
          <TabsList className="grid h-auto w-full grid-cols-3 gap-1 bg-muted p-1">
            {fases.map((f) => {
              const { obtenidos: o, total: t } = puntajeFase(f, evaluacion);
              return (
                <TabsTrigger
                  key={f.id}
                  value={f.id}
                  className={cn("flex flex-col gap-0.5 py-2", faseAccent[f.id].active)}
                >
                  <span className="text-xs font-semibold">{f.id}</span>
                  <span className="text-[10px] tabular-nums opacity-90">
                    {o}/{t}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {fases.map((f) => (
            <TabsContent key={f.id} value={f.id} className="mt-4 space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className={cn("h-2.5 w-2.5 rounded-full", faseAccent[f.id].dot)} />
                <h2 className="text-sm font-semibold">{f.titulo}</h2>
                <span className="text-xs text-muted-foreground">· {f.totalPuntos} pts</span>
              </div>
              {f.requisitos.map((req) => {
                const ev = evaluacion[req.id];
                const completado = isCompletado(req, ev);
                const incompleto = ev?.estado === "incompleto";
                return (
                  <Card
                    key={req.id}
                    className={cn(
                      "p-3",
                      completado && "border-green-500/50 bg-green-500/5",
                      incompleto && "border-destructive/50 bg-destructive/5",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{req.titulo}</p>
                        {incompleto && (ev?.motivo || ev?.comentario) && (
                          <p className="mt-1 text-xs text-destructive">
                            {ev.motivo}
                            {ev.motivo && ev.comentario ? " · " : ""}
                            {ev.comentario}
                          </p>
                        )}
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          completado && "bg-green-500/15 text-green-700 dark:text-green-400",
                          incompleto && "bg-destructive/15 text-destructive",
                          !completado && !incompleto && "bg-muted text-muted-foreground",
                        )}
                      >
                        {completado ? "✓" : incompleto ? "✗" : "—"}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <ScoreFooter obtenidos={obtenidos} total={total} faseLabel={faseActual.id} />
    </div>
  );
}
