// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Always run the Nitro deploy plugin on production builds (fails fast if `nitro` is missing).
  // Preset auto-detects the platform: VERCEL=1 -> .vercel/output, otherwise the Cloudflare default.
  nitro: true,
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    // Pre-bundle UI deps so first visits to pages don't trigger a re-optimize + stale chunk reload.
    optimizeDeps: {
      include: [
        "@radix-ui/react-tabs", "@radix-ui/react-switch", "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu",
        "@radix-ui/react-select", "@radix-ui/react-checkbox", "@radix-ui/react-collapsible", "@radix-ui/react-slider",
        "@radix-ui/react-label", "@radix-ui/react-slot", "sonner", "lucide-react", "class-variance-authority",
      ],
    },
  },
});
