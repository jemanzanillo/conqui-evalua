import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ArrowLeft, Pencil } from "lucide-react";
import { toast } from "sonner";
import { FASES } from "@/data/requisitos";
import {
  listUsuarios,
  listHistorial,
  listAllAspirantes,
  listRequisitosOverrides,
  upsertRequisitoOverride,
} from "@/server/admin.functions";
import type { RequisitoOverride } from "@/lib/storage";

export const Route = createFileRoute("/_authenticated/_admin/admin/")({
  component: AdminPage,
});

function AdminPage() {
  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3">
          <Link to="/">
            <Button variant="ghost" size="icon" aria-label="Volver">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold leading-tight">Panel del Coordinador</h1>
            <p className="text-xs text-muted-foreground">Administración general</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-4">
        <Tabs defaultValue="usuarios">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="historial">Historial</TabsTrigger>
            <TabsTrigger value="requisitos">Requisitos</TabsTrigger>
          </TabsList>
          <TabsContent value="usuarios" className="mt-4">
            <UsuariosTab />
          </TabsContent>
          <TabsContent value="historial" className="mt-4">
            <HistorialTab />
          </TabsContent>
          <TabsContent value="requisitos" className="mt-4">
            <RequisitosTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function UsuariosTab() {
  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ["admin-usuarios"],
    queryFn: () => listUsuarios(),
  });
  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando…</p>;
  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-3 py-2">Nombre</th>
            <th className="px-3 py-2">Correo</th>
            <th className="px-3 py-2">Rol</th>
            <th className="px-3 py-2 text-right">Aspirantes</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="px-3 py-2 font-medium">{u.nombre}</td>
              <td className="px-3 py-2 text-muted-foreground">{u.email}</td>
              <td className="px-3 py-2">
                <span
                  className={
                    u.rol === "admin"
                      ? "rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary"
                      : "rounded-full bg-muted px-2 py-0.5 text-xs"
                  }
                >
                  {u.rol}
                </span>
              </td>
              <td className="px-3 py-2 text-right tabular-nums">{u.aspirantesCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function HistorialTab() {
  const { data: aspirantes = [] } = useQuery({
    queryKey: ["admin-aspirantes"],
    queryFn: () => listAllAspirantes(),
  });
  const [filtro, setFiltro] = useState<string>("");
  const { data: historial = [], isLoading } = useQuery({
    queryKey: ["admin-historial", filtro],
    queryFn: () =>
      listHistorial({ data: filtro ? { aspiranteId: filtro } : {} }),
  });

  const tituloPorReq = useMemo(() => {
    const m = new Map<string, string>();
    for (const f of FASES) for (const r of f.requisitos) m.set(r.id, r.titulo);
    return m;
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label htmlFor="filtro" className="text-xs">
          Aspirante:
        </Label>
        <select
          id="filtro"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="h-9 rounded-md border bg-background px-2 text-sm"
        >
          <option value="">Todos</option>
          {aspirantes.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </select>
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : historial.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin registros.</p>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Fecha</th>
                <th className="px-3 py-2">Aspirante</th>
                <th className="px-3 py-2">Requisito</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Evaluador</th>
                <th className="px-3 py-2">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((h) => (
                <tr key={h.id} className="border-t align-top">
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">
                    {new Date(h.createdAt).toLocaleString("es-ES")}
                  </td>
                  <td className="px-3 py-2">{h.aspiranteNombre ?? "—"}</td>
                  <td className="px-3 py-2 text-xs">
                    {tituloPorReq.get(h.requisitoId) ?? h.requisitoId}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        h.estado === "completado"
                          ? "rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-700 dark:text-green-400"
                          : h.estado === "incompleto"
                            ? "rounded-full bg-destructive/15 px-2 py-0.5 text-xs text-destructive"
                            : "rounded-full bg-muted px-2 py-0.5 text-xs"
                      }
                    >
                      {h.estado}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {h.evaluadorNombre ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {h.motivo ?? ""}
                    {h.motivo && h.comentario ? " · " : ""}
                    {h.comentario ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function RequisitosTab() {
  const qc = useQueryClient();
  const { data: overrides = [] } = useQuery({
    queryKey: ["admin-overrides"],
    queryFn: () => listRequisitosOverrides(),
  });
  const map = useMemo(() => {
    const m = new Map<string, RequisitoOverride>();
    for (const o of overrides) m.set(o.requisitoId, o);
    return m;
  }, [overrides]);

  const [editing, setEditing] = useState<{
    id: string;
    titulo: string;
    descripcion: string;
    guia: string;
    evidencias: string;
  } | null>(null);

  const mut = useMutation({
    mutationFn: () => {
      if (!editing) throw new Error("nada");
      const evidencias = editing.evidencias
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      return upsertRequisitoOverride({
        data: {
          requisitoId: editing.id,
          titulo: editing.titulo || null,
          descripcion: editing.descripcion || null,
          guia: editing.guia || null,
          evidencias: evidencias.length > 0 ? evidencias : null,
        },
      });
    },
    onSuccess: () => {
      toast.success("Cambios guardados");
      qc.invalidateQueries({ queryKey: ["admin-overrides"] });
      qc.invalidateQueries({ queryKey: ["requisitos-overrides"] });
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      {FASES.map((fase) => (
        <Card key={fase.id} className="p-3">
          <h3 className="mb-2 text-sm font-semibold">
            {fase.id} · {fase.titulo}
          </h3>
          <ul className="divide-y">
            {fase.requisitos.map((r) => {
              const ov = map.get(r.id);
              return (
                <li key={r.id} className="flex items-center justify-between gap-2 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm">
                      {ov?.titulo ?? r.titulo}
                      {ov && (
                        <span className="ml-2 rounded bg-primary/15 px-1.5 py-0.5 text-[10px] text-primary">
                          editado
                        </span>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setEditing({
                        id: r.id,
                        titulo: ov?.titulo ?? r.titulo ?? "",
                        descripcion: ov?.descripcion ?? r.descripcion ?? "",
                        guia: ov?.guia ?? r.guia ?? "",
                        evidencias: (ov?.evidencias ?? r.evidencias ?? []).join("\n"),
                      })
                    }
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </li>
              );
            })}
          </ul>
        </Card>
      ))}

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader className="text-left">
            <SheetTitle>Editar requisito</SheetTitle>
            <SheetDescription>
              Estos cambios se ven para todos los evaluadores.
            </SheetDescription>
          </SheetHeader>
          {editing && (
            <div className="mt-4 space-y-3">
              <div>
                <Label>Título</Label>
                <Input
                  value={editing.titulo}
                  onChange={(e) => setEditing({ ...editing, titulo: e.target.value })}
                />
              </div>
              <div>
                <Label>Descripción corta</Label>
                <Input
                  value={editing.descripcion}
                  onChange={(e) =>
                    setEditing({ ...editing, descripcion: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Contexto / guía del manual</Label>
                <Textarea
                  rows={5}
                  value={editing.guia}
                  onChange={(e) => setEditing({ ...editing, guia: e.target.value })}
                />
              </div>
              <div>
                <Label>Evidencias (una por línea)</Label>
                <Textarea
                  rows={6}
                  value={editing.evidencias}
                  onChange={(e) =>
                    setEditing({ ...editing, evidencias: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setEditing(null)}>
                  Cancelar
                </Button>
                <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
                  {mut.isPending ? "Guardando…" : "Guardar"}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
