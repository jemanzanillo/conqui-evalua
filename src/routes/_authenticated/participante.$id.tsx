import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getParticipante } from "@/server/participantes.functions";
import { useCalificacion } from "@/hooks/useCalificacion";
import { CriterioCard } from "@/components/CriterioCard";
import { PuntajeFooter } from "@/components/PuntajeFooter";
import { CRITERIOS, PUNTAJE_MAXIMO } from "@/data/criterios";
import { totalCalificacion } from "@/lib/scoring";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/participante/$id")({
  component: ParticipantePage,
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-4">
      <p className="text-lg font-semibold">Participante no encontrado</p>
      <Link to="/">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  ),
});

function ParticipantePage() {
  const { id } = Route.useParams();

  const { data: participante, isLoading: pLoading } = useQuery({
    queryKey: ["participante", id],
    queryFn: () => getParticipante({ data: { id } }),
  });

  const { calificacion, setPuntos, submit, isSubmitting, submitError } = useCalificacion(id);

  if (pLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </div>
    );
  }
  if (!participante) throw notFound();

  const bloqueado = calificacion.estado === "enviado";
  const total = totalCalificacion(calificacion.puntos);

  const handleSubmit = async () => {
    try {
      await submit();
      toast.success("Calificación enviada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo enviar");
    }
  };

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
              <p className="truncate font-semibold">{participante.nombre}</p>
              <p className="truncate text-xs text-muted-foreground">
                {participante.orden ? `#${participante.orden}` : ""}
                {participante.orden && (participante.zona || participante.club) ? " · " : ""}
                {participante.zona ? `Zona ${participante.zona}` : ""}
                {participante.zona && participante.club ? " · " : ""}
                {participante.club ?? ""}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-3 px-3 py-4">
        {bloqueado && (
          <p className="rounded-lg border border-green-500/30 bg-green-500/5 px-3 py-2 text-xs text-green-700 dark:text-green-400">
            Ya enviaste tu calificación para este participante. Los controles están bloqueados.
          </p>
        )}
        {submitError && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {submitError.message}
          </p>
        )}
        {CRITERIOS.map((criterio) => (
          <CriterioCard
            key={criterio.id}
            criterio={criterio}
            valor={calificacion.puntos[criterio.id] ?? 0}
            disabled={bloqueado}
            onChange={(v) => setPuntos(criterio.id, v)}
          />
        ))}
      </main>

      <PuntajeFooter
        total={total}
        max={PUNTAJE_MAXIMO}
        estado={calificacion.estado}
        submittedAt={calificacion.submittedAt}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
