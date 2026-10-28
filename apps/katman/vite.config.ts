import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  base: (process.env.LAB_BASE || "").replace(/\/$/, "") + "/katman/",
});
