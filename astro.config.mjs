import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import path from "path";

export default defineConfig({
  site: "https://projectavinoc.com",
  base: "/",
  output: "static",
  integrations: [
    mdx(),
    react(),
  ],
  vite: {
    resolve: {
      alias: [
        // Redirect @/components/ui/* → lagrange's ui components (shadcn copies)
        {
          find: "@/components/ui",
          replacement: path.resolve("./src/components/lagrange/ui"),
        },
        // General @/* → src/* alias (matches remaining @/lib/*, @/hooks/*, etc.)
        {
          find: "@",
          replacement: path.resolve("./src"),
        },
      ],
    },
  },
});
