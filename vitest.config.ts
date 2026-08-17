import { defineConfig } from "vitest/config";
export default defineConfig({
  resolve: { alias: { "@": `${import.meta.dirname}/src` } },
  test: { environment: "node", include: ["tests/**/*.test.ts"], coverage: { reporter: ["text", "json", "html"], include: ["src/server/**/*.ts", "src/lib/**/*.ts"] } },
});
