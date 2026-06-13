import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParticipantes } from "@/hooks/useParticipantes";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ParticipanteCard } from "@/components/ParticipanteCard";
import { NuevoParticipanteDialog } from "@/components/NuevoParticipanteDialog";
import { Search, Trophy, Users } from "lucide-react";
import { HeaderUserMenu } from "../_authenticated";

export const Route = createFileRoute("/_authenticated/")({
  component: Dashboard,
});

function Dashboard() {
  const { participantes, isLoading, add, remove } = useParticipantes();
  const { data: user } = useCurrentUser();
  const [q, setQ] = useState("");
  const isAdmin = user?.rol === "admin";

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return participantes;
    return participantes.filter(
      (p) => p.nombre.toLowerCase().includes(t) || (p.club ?? "").toLowerCase().includes(t),
    );
  }, [participantes, q]);

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-tight">Concurso de Predicación</h1>
              <p className="text-xs text-muted-foreground">Calificación de jueces</p>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && <NuevoParticipanteDialog onCreate={(input) => add(input)} />}
              <Link to="/resultados">
                <Button variant="outline" size="icon" aria-label="Ver resultados">
                  <Trophy className="h-4 w-4" />
                </Button>
              </Link>
              <HeaderUserMenu />
            </div>
          </div>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar participante o club…"
              className="h-11 pl-9"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-2 px-4 py-4">
        {isLoading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Cargando…</p>
        ) : filtered.length === 0 ? (
          <EmptyState hasQuery={Boolean(q)} isAdmin={isAdmin} />
        ) : (
          filtered.map((p) => (
            <ParticipanteCard key={p.id} participante={p} canRemove={isAdmin} onRemove={remove} />
          ))
        )}
      </main>
    </div>
  );
}

function EmptyState({ hasQuery, isAdmin }: { hasQuery: boolean; isAdmin: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-background py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Users className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="font-medium">{hasQuery ? "Sin resultados" : "Aún no hay participantes"}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        {hasQuery
          ? "Prueba con otro nombre o club."
          : isAdmin
            ? "Toca “Participante” arriba para agregar el primero."
            : "El Coordinador aún no ha agregado participantes."}
      </p>
    </div>
  );
}
