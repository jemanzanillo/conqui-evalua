import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

type Props = {
  onCreate: (input: {
    nombre: string;
    club: string | null;
    zona: number | null;
    orden: number | null;
  }) => void;
};

export function NuevoParticipanteDialog({ onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [club, setClub] = useState("");
  const [zona, setZona] = useState("");
  const [orden, setOrden] = useState("");

  const submit = () => {
    if (!nombre.trim()) return;
    onCreate({
      nombre: nombre.trim(),
      club: club.trim() || null,
      zona: zona ? Number(zona) : null,
      orden: orden ? Number(orden) : null,
    });
    setNombre("");
    setClub("");
    setZona("");
    setOrden("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="h-4 w-4" />
          Participante
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo participante</DialogTitle>
          <DialogDescription>
            Agrega los datos del participante del concurso de predicación.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="part-nombre">Nombre completo</Label>
            <Input
              id="part-nombre"
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Ej. Juan Pérez"
              className="h-11"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="part-club">Club / Iglesia</Label>
              <Input
                id="part-club"
                value={club}
                onChange={(e) => setClub(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="Nombre del club"
                className="h-11"
              />
            </div>
            <div>
              <Label htmlFor="part-zona">Zona</Label>
              <Input
                id="part-zona"
                type="number"
                inputMode="numeric"
                value={zona}
                onChange={(e) => setZona(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="Ej. 5"
                className="h-11"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="part-orden">Orden de presentación (opcional)</Label>
            <Input
              id="part-orden"
              type="number"
              inputMode="numeric"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Ej. 1"
              className="h-11"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={!nombre.trim()}>
            Agregar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
