import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src"],
  dts: true,
  format: "esm",
  sourcemap: true,
  clean: true,
});
