import {
  createFileRoute,
  Outlet,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { getCurrentUser, signOut } from "@/server/auth.functions";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context, location }) => {
    const user = await context.queryClient.ensureQueryData({
      queryKey: ["currentUser"],
      queryFn: () => getCurrentUser(),
      staleTime: 5 * 60 * 1000,
    });
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
  const mut = useMutation({
    mutationFn: () => signOut(),
    onSuccess: async () => {
      await router.invalidate();
      router.navigate({ to: "/login" });
    },
  });

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs text-muted-foreground sm:inline">
        {user.nombre}
      </span>
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
