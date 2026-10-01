// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const base = process.env.VITE_BASE_PATH || "/";

// Vite reescribe `import(` como dynamic import aunque sea el nombre de un
// método de clase; @thatopen/components define `import(...) {}` y el bundle
// servido queda con sintaxis inválida. Se usa la forma `["import"](...)`.
const fixThatOpenImportMethod = {
  name: "fix-thatopen-import-method",
  enforce: "pre" as const,
  transform(code: string, id: string) {
    if (!id.includes("thatopen")) return null;
    const fixed = code.replace(/(\n\s*)import\(/g, '$1["import"](');
    return fixed === code ? null : { code: fixed, map: null };
  },
};

export default defineConfig({
  vite: {
    base,
    plugins: [fixThatOpenImportMethod],
  },
  nitro: false,
  tanstackStart: {
    // src/routes/tome-main es otro proyecto, no rutas de esta app: el generador
    // de rutas falla al intentar leerlo ("Crawling result not available").
    router: { routeFileIgnorePattern: "^tome-main$" },
    // Render como SPA estático: genera un único index.html (más assets JS/CSS)
    // que puede subirse a cualquier hosting estático (Netlify, Vercel static,
    // GitHub Pages, Apache, Nginx, S3, etc.). Las rutas dinámicas con $param
    // se resuelven en el navegador.
    spa: {
      enabled: true,
      prerender: {
        outputPath: "/index.html",
        crawlLinks: false,
      },
    },
  },
});
