import dts from "vite-plugin-dts";
import path from "path";
import { defineConfig, UserConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [dts({ rollupTypes: true })],
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "steinlib-ts",
      formats: ["es", "cjs", "umd"],
      fileName: (format) => `index.${format}.js`,
    },
  },
} satisfies UserConfig);
