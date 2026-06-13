import {
  createFileRoute,
  isRedirect,
  Link,
  Outlet,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LogOut, Shield } from "lucide-react";
import { getCurrentUser, signOut } from "@/server/auth.functions";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context, location }) => {
    let user: Awaited<ReturnType<typeof getCurrentUser>> = null;
    try {
      user = await context.queryClient.ensureQueryData({
        queryKey: ["currentUser"],
        queryFn: () => getCurrentUser(),
        staleTime: 5 * 60 * 1000,
      });
    } catch (err) {
      if (isRedirect(err)) throw err;
      // Si el servidor falla (BD caída, secret faltante…), mandamos a login
      // en vez de mostrar pantalla rota.
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
    if (!user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
    return { user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return <Outlet />;
}

export function HeaderUserMenu() {
  const { data: user } = useCurrentUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const mut = useMutation({
    mutationFn: () => signOut(),
    onSuccess: async () => {
      queryClient.setQueryData(["currentUser"], null);
      queryClient.removeQueries({ queryKey: ["currentUser"] });
      queryClient.clear();
      await router.invalidate();
      router.navigate({ to: "/login" });
    },
  });

  if (!user) return null;

  return (
    <div className="flex items-center gap-1">
      <span className="hidden text-xs text-muted-foreground sm:inline">{user.nombre}</span>
      {user.rol === "admin" && (
        <Link to="/admin">
          <Button variant="ghost" size="icon" aria-label="Panel admin">
            <Shield className="h-4 w-4" />
          </Button>
        </Link>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => mut.mutate()}
        disabled={mut.isPending}
        aria-label="Cerrar sesión"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
