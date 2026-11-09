import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "index.ts",
    "shutdown-chartmuseum/index": "shutdown-chartmuseum.ts",
  },
  platform: "node",
  target: "node24",
  format: ["cjs"],
  outExtension: () => ({ js: ".cjs" }),
  noExternal: [/.*/],
  splitting: false,
  sourcemap: true,
  minify: true,
  clean: true,
});
