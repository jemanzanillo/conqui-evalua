import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckSquare, Info } from "lucide-react";
import type { Requisito } from "@/data/requisitos";

type Props = {
  requisito: Requisito;
  faseLabel: string;
};

export function RequisitoGuiaSheet({ requisito, faseLabel }: Props) {
  const { guia, evidencias } = requisito;
  if (!guia && (!evidencias || evidencias.length === 0)) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Ver guía del manual"
          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-primary"
        >
          <Info className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-md"
      >
        <SheetHeader className="text-left">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {faseLabel} · Guía del manual
          </p>
          <SheetTitle className="text-lg leading-snug">{requisito.titulo}</SheetTitle>
          {requisito.descripcion && (
            <SheetDescription className="text-sm">
              {requisito.descripcion}
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {guia && (
            <section>
              <div className="mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Contexto</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{guia}</p>
            </section>
          )}

          {evidencias && evidencias.length > 0 && (
            <section>
              <div className="mb-2 flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                <h3 className="text-sm font-semibold">Qué debe presentar</h3>
              </div>
              <ul className="space-y-2">
                {evidencias.map((ev, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm leading-relaxed text-foreground"
                  >
                    <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="border-t pt-4 text-xs text-muted-foreground">
            Fuente: Manual Curricular de Guía Mayor 2022 — Asociación General, Departamento
            de Ministerios Juveniles.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
