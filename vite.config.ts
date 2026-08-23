// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";
import { win32 } from "node:path";

const lovableMcpPlugin = mcpPlugin();

// Vite normalizes config.root to forward slashes, while mcp-js 0.27.0 resolves
// child paths with Windows separators before checking that they remain inside
// the project. Give only that plugin hook a consistently normalized root.
if (process.platform === "win32" && typeof lovableMcpPlugin.configResolved === "function") {
  const configResolved = lovableMcpPlugin.configResolved;
  lovableMcpPlugin.configResolved = function (config) {
    return configResolved.call(this, { ...config, root: win32.normalize(config.root) });
  };
}

export default defineConfig({
  plugins: [lovableMcpPlugin],
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
