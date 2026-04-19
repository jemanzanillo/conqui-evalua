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
import { Plus } from "lucide-react";

type Props = {
  onCreate: (nombre: string) => void;
};

export function NuevoAspiranteDialog({ onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");

  const submit = () => {
    if (!nombre.trim()) return;
    onCreate(nombre.trim());
    setNombre("");
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
          <DialogDescription>Agrega el nombre del aspirante a evaluar.</DialogDescription>
        </DialogHeader>
        <Input
          autoFocus
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Nombre completo"
          className="h-11"
        />
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
