import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({ target: "vercel" }),
    // Required: provides the automatic JSX runtime. Without it the build
    // falls back to the classic transform that expects a global `React`,
    // crashing the client with "React is not defined" before hydration.
    viteReact(),
  ],
  ssr: {
    noExternal: true,
  },
});
