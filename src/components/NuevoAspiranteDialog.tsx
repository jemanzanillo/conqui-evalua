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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

type Props = {
  onCreate: (input: { nombre: string; zona: number | null; club: string | null }) => void;
};

export function NuevoAspiranteDialog({ onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [zona, setZona] = useState<string>("");
  const [club, setClub] = useState("");

  const submit = () => {
    if (!nombre.trim()) return;
    onCreate({
      nombre: nombre.trim(),
      zona: zona ? Number(zona) : null,
      club: club.trim() || null,
    });
    setNombre("");
    setZona("");
    setClub("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="h-4 w-4" />
          Aspirante
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo aspirante</DialogTitle>
          <DialogDescription>
            Agrega los datos del aspirante a evaluar.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="asp-nombre">Nombre completo</Label>
            <Input
              id="asp-nombre"
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
              <Label htmlFor="asp-zona">Zona</Label>
              <Select value={zona} onValueChange={setZona}>
                <SelectTrigger id="asp-zona" className="h-11">
                  <SelectValue placeholder="Selecciona…" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }, (_, i) => i + 1).map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      Zona {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="asp-club">Club</Label>
              <Input
                id="asp-club"
                value={club}
                onChange={(e) => setClub(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="Nombre del club"
                className="h-11"
              />
            </div>
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
