import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  shareToken: string;
};

export function CompartirLinkButton({ shareToken }: Props) {
  const handle = async () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/observador/${shareToken}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado", {
        description: "Compártelo con quien quiera ver el progreso (solo lectura).",
      });
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={handle} className="gap-1.5">
      <Share2 className="h-3.5 w-3.5" />
      Compartir
    </Button>
  );
}
