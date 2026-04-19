import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { useAspirantes } from "@/hooks/useAspirantes";
import { AspiranteCard } from "@/components/AspiranteCard";
import { NuevoAspiranteDialog } from "@/components/NuevoAspiranteDialog";
import { Search, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Evaluación Guías Mayores" },
      {
        name: "description",
        content:
          "Aplicación mobile-first para evaluación presencial de aspirantes a Guías Mayores.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { aspirantes, add, remove } = useAspirantes();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return aspirantes;
    return aspirantes.filter((a) => a.nombre.toLowerCase().includes(t));
  }, [aspirantes, q]);

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold leading-tight">Evaluación GM</h1>
              <p className="text-xs text-muted-foreground">Hoja de cotejo Z5 2026</p>
            </div>
            <NuevoAspiranteDialog onCreate={(n) => add(n)} />
          </div>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar aspirante…"
              className="h-11 pl-9"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-2 px-4 py-4">
        {filtered.length === 0 ? (
          <EmptyState hasQuery={Boolean(q)} />
        ) : (
          filtered.map((a) => <AspiranteCard key={a.id} aspirante={a} onRemove={remove} />)
        )}
      </main>
    </div>
  );
}

function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-background py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Users className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="font-medium">
        {hasQuery ? "Sin resultados" : "Aún no hay aspirantes"}
      </p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        {hasQuery
          ? "Prueba con otro nombre."
          : "Toca “Aspirante” arriba para agregar el primero y comenzar la evaluación."}
      </p>
    </div>
  );
}
