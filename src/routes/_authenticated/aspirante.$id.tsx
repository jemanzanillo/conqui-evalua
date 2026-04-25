import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { FASES, type Fase } from "@/data/requisitos";
import { getAspirante } from "@/server/aspirantes.functions";
import { useEvaluacion } from "@/hooks/useEvaluacion";
import { puntajeFase } from "@/lib/scoring";
import { RequisitoCard } from "@/components/RequisitoCard";
import { ScoreFooter } from "@/components/ScoreFooter";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/aspirante/$id")({
  component: AspirantePage,
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-4">
      <p className="text-lg font-semibold">Aspirante no encontrado</p>
      <Link to="/">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  ),
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

function AspirantePage() {
  const { id } = Route.useParams();

  const { data: aspirante, isLoading: aspLoading } = useQuery({
    queryKey: ["aspirante", id],
    queryFn: () => getAspirante({ data: { id } }),
  });

  const { evaluacion, updateRequisito } = useEvaluacion(id);
  const [tab, setTab] = useState<Fase>("EVA-1");

  if (aspLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </div>
    );
  }
  if (!aspirante) throw notFound();

  const faseActual = FASES.find((f) => f.id === tab)!;
  const { obtenidos, total } = puntajeFase(faseActual, evaluacion);

  return (
    <div className="min-h-screen bg-muted/30 pb-32">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-3 py-3">
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="icon" aria-label="Volver">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{aspirante.nombre}</p>
              <p className="text-xs text-muted-foreground">{faseActual.fecha}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-3 py-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Fase)}>
          <TabsList className="grid h-auto w-full grid-cols-3 gap-1 bg-muted p-1">
            {FASES.map((f) => {
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

          {FASES.map((f) => (
            <TabsContent key={f.id} value={f.id} className="mt-4 space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className={cn("h-2.5 w-2.5 rounded-full", faseAccent[f.id].dot)} />
                <h2 className="text-sm font-semibold">{f.titulo}</h2>
                <span className="text-xs text-muted-foreground">· {f.totalPuntos} pts</span>
              </div>
              {f.requisitos.map((req) => (
                <RequisitoCard
                  key={req.id}
                  requisito={req}
                  evaluacion={evaluacion[req.id]}
                  faseLabel={f.id}
                  onChange={(patch) => updateRequisito(req.id, patch)}
                />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <ScoreFooter obtenidos={obtenidos} total={total} faseLabel={faseActual.id} />
    </div>
  );
}
