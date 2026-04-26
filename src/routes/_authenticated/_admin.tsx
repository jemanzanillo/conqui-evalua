import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getCurrentUser } from "@/server/auth.functions";

export const Route = createFileRoute("/_authenticated/_admin")({
  beforeLoad: async ({ context, location }) => {
    const user = await context.queryClient.ensureQueryData({
      queryKey: ["currentUser"],
      queryFn: () => getCurrentUser(),
      staleTime: 5 * 60 * 1000,
    });
    if (!user || user.rol !== "admin") {
      throw redirect({ to: "/", search: { redirect: location.href } as never });
    }
  },
  component: () => <Outlet />,
});
