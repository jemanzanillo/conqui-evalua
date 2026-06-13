import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import type { Criterio } from "@/data/criterios";

type Props = {
  criterio: Criterio;
};

export function CriterioGuiaSheet({ criterio }: Props) {
  if (!criterio.guia) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Ver guía de este criterio"
          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-primary"
        >
          <Info className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="text-left">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Guía de evaluación · {criterio.puntosMax} pts
          </p>
          <SheetTitle className="text-lg leading-snug">{criterio.titulo}</SheetTitle>
          {criterio.descripcion && (
            <SheetDescription className="text-sm">{criterio.descripcion}</SheetDescription>
          )}
        </SheetHeader>
        <div className="mt-4">
          <p className="text-sm leading-relaxed text-muted-foreground">{criterio.guia}</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
