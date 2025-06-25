import { defineConfig } from "tsdown";

const config: unknown = defineConfig({
  entry: ["src"],
  format: ["cjs", "esm"],
});

export default config;
