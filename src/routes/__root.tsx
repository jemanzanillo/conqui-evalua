import {
  Outlet,
  Link,
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import appCss from "../styles.css?url";

interface RouterContext {
  queryClient: QueryClient;
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página no encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La página que buscas no existe o fue movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Evaluación Guías Mayores Z5" },
      {
        name: "description",
        content:
          "Aplicación mobile-first para evaluación presencial de aspirantes a Guías Mayores.",
      },
      { property: "og:title", content: "Evaluación Guías Mayores Z5" },
      { name: "twitter:title", content: "Evaluación Guías Mayores Z5" },
      { name: "description", content: "Web app for evaluating aspiring Master Guides, digitizing in-person assessments." },
      { property: "og:description", content: "Web app for evaluating aspiring Master Guides, digitizing in-person assessments." },
      { name: "twitter:description", content: "Web app for evaluating aspiring Master Guides, digitizing in-person assessments." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3bcb8ae4-26ba-489a-8a12-24d857d76289/id-preview-a62ead11--25e26c2c-e1b4-49bb-888e-4bf05cadc172.lovable.app-1777067408541.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3bcb8ae4-26ba-489a-8a12-24d857d76289/id-preview-a62ead11--25e26c2c-e1b4-49bb-888e-4bf05cadc172.lovable.app-1777067408541.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
