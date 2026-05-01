import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import type { FaseInfo } from "@/data/requisitos";
import type { EvaluacionAspirante } from "@/lib/storage";
import { isCompletado } from "@/lib/scoring";

type Props = {
  fase: FaseInfo;
  evaluacion: EvaluacionAspirante;
};

export function CopiarEvaButton({ fase, evaluacion }: Props) {
  const handle = async () => {
    const valores = fase.requisitos.map((r) =>
      isCompletado(r, evaluacion[r.id]) ? "1" : "0",
    );
    const text = valores.join("\t");
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copiado ${fase.id}`, {
        description: `${valores.length} valores listos para pegar en Excel.`,
      });
    } catch {
      toast.error("No se pudo copiar al portapapeles");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handle}
      className="gap-1.5"
    >
      <Copy className="h-3.5 w-3.5" />
      Copiar 1/0 ({fase.id})
    </Button>
  );
}
