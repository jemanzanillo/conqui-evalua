import { createFileRoute, isRedirect, redirect, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { getCurrentUser, signIn } from "@/server/auth.functions";

const searchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/login")({
  validateSearch: (search) => searchSchema.parse(search),
  beforeLoad: async ({ context, search }) => {
    try {
      const user = await context.queryClient.ensureQueryData({
        queryKey: ["currentUser"],
        queryFn: () => getCurrentUser(),
        staleTime: 5 * 60 * 1000,
      });
      if (user) {
        throw redirect({ to: search.redirect ?? "/" });
      }
    } catch (err) {
      if (isRedirect(err)) throw err;
      // Si el server falla, mostramos el login igualmente — el usuario verá
      // el error específico al intentar entrar.
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const search = Route.useSearch();

  const onSuccess = async () => {
    await router.invalidate();
    router.navigate({ to: search.redirect ?? "/" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-4 text-center">
          <h1 className="text-xl font-bold">Evaluación GM</h1>
          <p className="text-xs text-muted-foreground">Hoja de cotejo Z5 2026</p>
        </div>
        <SignInForm onSuccess={onSuccess} />
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          ¿No tienes cuenta? Solicítala al Coordinador.
        </p>
      </Card>
    </div>
  );
}

function SignInForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: () => signIn({ data: { email, password } }),
    onSuccess: () => {
      setError(null);
      onSuccess();
    },
    onError: (e: Error) => setError(e.message),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    mut.mutate();
  };

  return (
    <form onSubmit={submit} className="mt-2 space-y-3">
      <div>
        <Label htmlFor="signin-email">Correo</Label>
        <Input
          id="signin-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-11"
        />
      </div>
      <div>
        <Label htmlFor="signin-password">Contraseña</Label>
        <Input
          id="signin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="h-11"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="submit" className="h-11 w-full" disabled={mut.isPending}>
        {mut.isPending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
