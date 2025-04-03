import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // server: {
  //   https: {
  //     key: "./connect.key",
  //     cert: "./connect.crt",
  //   },
  // },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
