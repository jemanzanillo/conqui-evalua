import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PUNTAJE_MAXIMO } from "@/data/criterios";
import {
  listUsuarios,
  listHistorial,
  listCalificacionesAdmin,
  reabrirCalificacion,
  createJuez,
  deleteUsuario,
} from "@/server/admin.functions";
import { useCurrentUser } from "@/hooks/useCurrentUser";

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
        <Tabs defaultValue="resultados">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resultados">Resultados</TabsTrigger>
            <TabsTrigger value="jueces">Jueces</TabsTrigger>
            <TabsTrigger value="historial">Historial</TabsTrigger>
          </TabsList>
          <TabsContent value="resultados" className="mt-4">
            <ResultadosTab />
          </TabsContent>
          <TabsContent value="jueces" className="mt-4">
            <JuecesTab />
          </TabsContent>
          <TabsContent value="historial" className="mt-4">
            <HistorialTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function ResultadosTab() {
  const qc = useQueryClient();
  const { data: participantes = [], isLoading } = useQuery({
    queryKey: ["admin-calificaciones"],
    queryFn: () => listCalificacionesAdmin(),
  });

  const reabrirMut = useMutation({
    mutationFn: (vars: { participanteId: string; juezId: string }) =>
      reabrirCalificacion({ data: vars }),
    onSuccess: () => {
      toast.success("Calificación reabierta");
      qc.invalidateQueries({ queryKey: ["admin-calificaciones"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando…</p>;
  if (participantes.length === 0)
    return <p className="text-sm text-muted-foreground">Aún no hay participantes.</p>;

  return (
    <div className="space-y-3">
      {participantes.map((p) => (
        <Card key={p.id} className="p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {p.orden ? `#${p.orden} · ` : ""}
                {p.nombre}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {p.zona ? `Zona ${p.zona}` : ""}
                {p.zona && p.club ? " · " : ""}
                {p.club ?? ""}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-lg font-bold tabular-nums">{p.totalGeneral}</p>
              <p className="text-[10px] text-muted-foreground">total</p>
            </div>
          </div>
          {p.calificaciones.length === 0 ? (
            <p className="text-xs text-muted-foreground">Ningún juez ha calificado aún.</p>
          ) : (
            <ul className="divide-y">
              {p.calificaciones.map((c) => (
                <li key={c.juezId} className="flex items-center justify-between gap-2 py-1.5">
                  <span className="truncate text-sm">{c.juezNombre ?? "—"}</span>
                  <div className="flex items-center gap-2">
                    {c.estado === "enviado" ? (
                      <>
                        <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                          {c.total}/{PUNTAJE_MAXIMO}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            reabrirMut.mutate({ participanteId: p.id, juezId: c.juezId })
                          }
                          aria-label="Reabrir calificación"
                        >
                          <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </>
                    ) : (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        Pendiente
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ))}
    </div>
  );
}

function JuecesTab() {
  const qc = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ["admin-usuarios"],
    queryFn: () => listUsuarios(),
  });

  const [openNew, setOpenNew] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "juez" as "juez" | "admin",
  });

  const createMut = useMutation({
    mutationFn: () => createJuez({ data: form }),
    onSuccess: () => {
      toast.success("Cuenta creada");
      qc.invalidateQueries({ queryKey: ["admin-usuarios"] });
      setOpenNew(false);
      setForm({ nombre: "", email: "", password: "", rol: "juez" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteUsuario({ data: { id } }),
    onSuccess: () => {
      toast.success("Cuenta eliminada");
      qc.invalidateQueries({ queryKey: ["admin-usuarios"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando…</p>;

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Nuevo juez
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear cuenta</DialogTitle>
              <DialogDescription>
                La persona podrá iniciar sesión con este correo y contraseña.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Nombre</Label>
                <Input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
              </div>
              <div>
                <Label>Correo</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Contraseña (mín. 8)</Label>
                <Input
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <div>
                <Label>Rol</Label>
                <Select
                  value={form.rol}
                  onValueChange={(v) => setForm({ ...form, rol: v as "juez" | "admin" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="juez">Juez</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpenNew(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => createMut.mutate()}
                disabled={
                  createMut.isPending || !form.nombre || !form.email || form.password.length < 8
                }
              >
                {createMut.isPending ? "Creando…" : "Crear"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Correo</th>
              <th className="px-3 py-2">Rol</th>
              <th className="px-3 py-2 text-right">Enviadas</th>
              <th className="px-3 py-2"></th>
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
                <td className="px-3 py-2 text-right tabular-nums">{u.enviadas}</td>
                <td className="px-3 py-2 text-right">
                  {currentUser?.id !== u.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(`¿Eliminar la cuenta de ${u.nombre}?`)) deleteMut.mutate(u.id);
                      }}
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function HistorialTab() {
  const { data: historial = [], isLoading } = useQuery({
    queryKey: ["admin-historial"],
    queryFn: () => listHistorial({ data: {} }),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando…</p>;
  if (historial.length === 0)
    return <p className="text-sm text-muted-foreground">Sin registros.</p>;

  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-3 py-2">Fecha</th>
            <th className="px-3 py-2">Participante</th>
            <th className="px-3 py-2">Juez</th>
            <th className="px-3 py-2">Acción</th>
            <th className="px-3 py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {historial.map((h) => (
            <tr key={h.id} className="border-t align-top">
              <td className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">
                {new Date(h.createdAt).toLocaleString("es-ES")}
              </td>
              <td className="px-3 py-2">{h.participanteNombre ?? "—"}</td>
              <td className="px-3 py-2 text-xs text-muted-foreground">{h.juezNombre ?? "—"}</td>
              <td className="px-3 py-2">
                <span
                  className={
                    h.accion === "enviado"
                      ? "rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-700 dark:text-green-400"
                      : "rounded-full bg-muted px-2 py-0.5 text-xs"
                  }
                >
                  {h.accion}
                </span>
              </td>
              <td className="px-3 py-2 text-right tabular-nums">
                {h.total}/{PUNTAJE_MAXIMO}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
