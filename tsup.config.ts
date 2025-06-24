import { defineConfig } from "tsup";

const config: unknown = defineConfig({
  entry: ["src"],
  format: ["cjs", "esm"],
  bundle: false,
  clean: true,
  dts: true,
});

export default config;
